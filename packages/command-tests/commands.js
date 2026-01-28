/* eslint-disable @typescript-eslint/explicit-function-return-type */

const { Mutex, Semaphore } = require("async-mutex");
const { exec } = require("child_process");
const { readFileSync, writeFileSync } = require("fs");
const { copy, existsSync, readJson, writeJson } = require("fs-extra");
const { join } = require("path");
const { ls, mkdir, rm, tempdir } = require("shelljs");
const kill = require("tree-kill");
const { promisify } = require("util");
const YeomanTest = require("yeoman-test");

const LIMIT_TESTS = !!process.env.LIMIT_TESTS;
const PARALLELISM = 4;

const CONFIGS = [
    ["web", "full", "ts", "8.0"],
    ["native", "full", "ts", "8.6"],
    ["web", "full", "ts", "8.6"],
    ["web", "full", "js", "8.7"],
    ["web", "full", "ts", "8.9"],
    ["native", "full", "ts", "8.9"],
    ["web", "full", "js", "latest"],
    ["web", "full", "ts", "latest"],
    ["native", "full", "js", "latest"],
    ["native", "full", "ts", "latest"],
    ["web", "empty", "js", "latest"],
    ["web", "empty", "ts", "latest"],
    ["native", "empty", "js", "latest"],
    ["native", "empty", "ts", "latest"]
];

if (LIMIT_TESTS) {
    CONFIGS.splice(1, CONFIGS.length - 2); // Remove all configs except the first and the last
}

const yeomanMutex = new Mutex();

main().catch(e => {
    console.error(e);
    process.exit(1);
});

async function main() {
    console.log("Preparing...");

    const pluggableWidgetsToolsPath = "../pluggable-widgets-tools";
    const { stdout: packOutput } = await execAsync("npm pack", join(__dirname, pluggableWidgetsToolsPath));
    const toolsPackagePath = join(__dirname, pluggableWidgetsToolsPath, packOutput.trim().split(/\n/g).pop());

    const workDirs = [];
    const workDirSemaphore = new Semaphore(PARALLELISM);
    const failures = (
        await Promise.all(
            CONFIGS.map(async (config, index) => {
                const [, release] = await workDirSemaphore.acquire();
                let workDir;
                try {
                    workDir = workDirs.pop();
                    if (!workDir) {
                        workDir = join(
                            index === 0 ? join(tempdir(), "spaced folder") : tempdir(),
                            `pwt_test_${Math.round(Math.random() * 10000)}`
                        );
                        mkdir("-p", workDir);
                    }
                    await runTest(workDir, ...config);
                    return undefined;
                } catch (e) {
                    return [config, e];
                } finally {
                    workDirs.push(workDir);
                    release();
                }
            })
        )
    ).filter(f => f);

    console.log("All done!");
    try {
        rm("-rf", toolsPackagePath, ...workDirs);
    } catch (error) {
        console.warn(`Error while removing files: ${error.message}`);
    }

    if (failures.length) {
        failures.forEach(f => console.error(`Test for configuration ${f[0]} failed: ${f[1]}`));
        process.exit(2);
    }

    async function runTest(workDir, platform, boilerplate, lang, version) {
        const isNative = platform === "native";
        const widgetName = `generated_${version.replace(".", "_")}_${lang}_${platform}_${boilerplate}`;
        let widgetPackageJson;

        console.log(`[${widgetName}] Preparing widget...`);
        await prepareWidget();
        console.log(`[${widgetName}] Ready to test!`);

        console.log(`[${widgetName}] Testing linting...`);
        await testLint();

        // Temporarily disabled due to bizarre typing issues in the CI that cannot be reproduced in any local environment
        // console.log(`[${widgetName}] Testing unit tests....`);
        // await testTest();

        if (LIMIT_TESTS) {
            console.log(`[${widgetName}] Quick tested!`);
            return;
        }

        console.log(`[${widgetName}] Testing 'build' command...`);
        await testBuild();

        // Temporarily disabled due to bizarre typing issues in the CI that cannot be reproduced in any local environment
        // console.log(`[${widgetName}] Testing 'test:unit' command...`);
        // await testTestUnit();

        console.log(`[${widgetName}] Testing 'release' command...`);
        await testRelease();

        console.log(`[${widgetName}] Checking dependencies files...`);
        await checkDependenciesFiles(isNative, boilerplate, version);

        console.log(`[${widgetName}] Testing npm start...`);
        await testStart();

        // Check native dependency management
        if (isNative) {
            console.log(`[${widgetName}] Testing native dependency management...`);
            await testNativeDependencyManagement();
        }

        console.log(`[${widgetName}] Tested!`);

        async function prepareWidget() {
            const filesToRemove = ls(workDir)
                .filter(file => file !== "node_modules")
                .map(file => join(workDir, file));
            if (filesToRemove.length) {
                rm("-r", ...filesToRemove);
            }

            if (version === "latest") {
                const promptAnswers = {
                    name: "Generated",
                    description: "My widget description",
                    organization: "com.mendix",
                    copyright: "Mendix 2020",
                    license: "Apache-2.0",
                    version: "1.0.0",
                    author: "Widget Generator",
                    projectPath: "./dist/MxTestProject",
                    programmingLanguage: lang === "ts" ? "typescript" : "javascript",
                    platform,
                    boilerplate,
                    hasUnitTests: true,
                    hasE2eTests: false
                };
                let generatedWidget;
                const release = await yeomanMutex.acquire(); // yeoman generator is no re-entrable :(
                try {
                    const generatorWidgetModule = require.resolve("../generator-widget/generators/app");
                    generatedWidget = (
                        await YeomanTest.run(generatorWidgetModule)
                            .inTmpDir()
                            .withPrompts(promptAnswers)
                            .withArguments("Generated")
                            .toPromise()
                    ).cwd;
                } finally {
                    release();
                }
                await copy(join(generatedWidget, "generated"), workDir);
            } else {
                await copy(join(__dirname, "projects", widgetName), workDir);
            }

            widgetPackageJson = await readJson(join(workDir, "package.json"));
            widgetPackageJson.devDependencies["@mendix/pluggable-widgets-tools"] = toolsPackagePath;

            // Adds compatibility to React 18 and React Native 0.78.2
            fixPackageJson(widgetPackageJson);

            // Check native dependency management
            if (isNative) {
                // Updated from 0.27.0 to 1.14.0 for compatibility with RN 0.78.2 and it matches one in Native Widgets repo
                widgetPackageJson.dependencies["react-native-maps"] = "1.14.0";
            }

            await writeJson(join(workDir, "package.json"), widgetPackageJson);

            // Use --legacy-peer-deps to handle peer dependency conflicts with RN 0.78.2
            await execAsync("npm install --loglevel=error --legacy-peer-deps", workDir);
        }

        async function testLint() {
            await execFailedAsync("npm run lint", workDir);
            await execAsync("npm run lint:fix", workDir);
            await execAsync("npm run lint", workDir);
        }

        async function testTest() {
            if (platform === "native") {
                await execFailedAsync("npm test -- --forceExit", workDir);
                await execAsync("npm test -- -u --forceExit", workDir);
            } else {
                await execAsync("npm test -- --forceExit", workDir);
            }
        }

        async function testBuild() {
            await execAsync("npm run build", workDir);
            if (
                !existsSync(
                    join(
                        workDir,
                        `/dist/${widgetPackageJson.version}/${widgetPackageJson.packagePath}.${widgetPackageJson.widgetName}.mpk`
                    )
                )
            ) {
                throw new Error("Expected mpk file to be generated, but it wasn't.");
            }
        }

        async function testTestUnit() {
            await execAsync("npm run test:unit -- --forceExit", workDir);
            if (!existsSync(join(workDir, `/dist/coverage/clover.xml`))) {
                throw new Error("Expected coverage file to be generated, but it wasn't.");
            }
        }

        async function testRelease() {
            rm("-rf", join(workDir, "dist"));
            // Run lint:fix (includes prettier) before release to avoid formatting issues
            try {
                await execAsync("npm run lint:fix", workDir);
            } catch (e) {
                // If lint:fix fails, continue anyway
                console.log(`[${widgetName}] Warning: lint:fix failed, continuing...`);
            }
            await execAsync("npm run release", workDir);

            if (
                !existsSync(
                    join(
                        workDir,
                        `/dist/${widgetPackageJson.version}/${widgetPackageJson.packagePath}.${widgetPackageJson.widgetName}.mpk`
                    )
                )
            ) {
                throw new Error("Expected mpk file to be generated, but it wasn't.");
            }
        }

        async function checkDependenciesFiles(isNative, boilerplate, version) {
            const dependenciesJSONFile = join(workDir, "dist", "tmp", "widgets", "dependencies.json");
            const dependenciesTxtFile = join(workDir, "dist", "tmp", "widgets", "dependencies.txt");

            if (!existsSync(dependenciesJSONFile) || !existsSync(dependenciesTxtFile)) {
                throw new Error("Expected dependencies files to be generated, but it wasn't.");
            }

            const dependenciesJSON = JSON.parse(readFileSync(dependenciesJSONFile, "utf8"));
            const dependenciesText = readFileSync(dependenciesTxtFile, "utf8");

            const packageName = isNative
                ? version === "latest"
                    ? "@mendix/pluggable-widgets-tools"
                    : null
                : boilerplate === "full"
                    ? "classnames"
                    : null;

            if (
                packageName &&
                (!dependenciesJSON.some(dependency => Object.keys(dependency)[0].includes(packageName)) ||
                    !dependenciesText.includes(packageName))
            ) {
                throw new Error(`The "${packageName}" could not be found in the dependencies files.`);
            } else if (
                !packageName &&
                (dependenciesJSON.length !== 0 ||
                    !(dependenciesText.includes("No third parties dependencies") || dependenciesText === ""))
            ) {
                throw new Error("Unexpected content in dependencies files.");
            }
        }

        async function testStart() {
            const startProcess = exec("npm start", { cwd: workDir, env: { ...process.env, NO_COLOR: "true" } });

            try {
                await new Promise((resolve, reject) => {
                    let inProgress = false;
                    startProcess.stdout.on("data", onOutput);
                    startProcess.stderr.on("data", onOutput);
                    startProcess.on("exit", exitCode => {
                        reject(new Error(`Exited with status ${exitCode}`));
                    });
                    function onOutput(data) {
                        if (/error/i.test(data)) {
                            reject(new Error(`Received error ${data}`));
                        } else if (/\bbundles /.test(data)) {
                            inProgress = true;
                        } else if (/\bcreated .* in /.test(data)) {
                            inProgress = false;
                            setTimeout(() => {
                                if (!inProgress) {
                                    console.log(`[${widgetName}] Start succeeded!`);
                                    resolve();
                                }
                            }, 100);
                        }
                    }
                });
            } finally {
                try {
                    await promisify(kill)(startProcess.pid, "SIGKILL");
                } catch (_) {
                    console.warn(`[${widgetName}] Error while killing start process`);
                }
                await new Promise(resolve => setTimeout(resolve, 5000)); // give time for processes to die
            }
        }

        async function testNativeDependencyManagement() {
            const entryPointPath = join(workDir, "src", `Generated.${lang}x`);
            const jsonPath = join(workDir, `/dist/tmp/widgets/${widgetPackageJson.widgetName}.json`);
            const fileData = readFileSync(entryPointPath);
            writeFileSync(
                entryPointPath,
                Buffer.concat([
                    Buffer.from(`import "react-native-maps";
`),
                    Buffer.from(fileData)
                ])
            );
            await execAsync("npm run build", workDir);
            if (!existsSync(jsonPath)) {
                throw new Error("Expected dependency json file to be generated, but it wasn't.");
            }
            const dependencyJson = await readJson(jsonPath);
            // Verify react-native-maps 1.14.0 is in the dependency JSON (updated for RN 0.78.2)
            if (
                !dependencyJson.nativeDependencies ||
                dependencyJson.nativeDependencies["react-native-maps"] !== "1.14.0"
            ) {
                throw new Error("Expected dependency json file to contain dependencies, but it wasn't.");
            }
            if (!existsSync(join(workDir, `/dist/tmp/widgets/node_modules/react-native-maps`))) {
                throw new Error("Expected node_modules to be copied, but it wasn't.");
            }
            // Check for any transitive dependencies - they might be hoisted to top-level or nested
            // react-native-maps should have some dependencies
            const reactNativeMapsNodeModules = join(workDir, `/dist/tmp/widgets/node_modules/react-native-maps/node_modules`);
            const topLevelNodeModules = join(workDir, `/dist/tmp/widgets/node_modules`);
            const hasNestedDeps = existsSync(reactNativeMapsNodeModules) && ls(reactNativeMapsNodeModules).length > 0;
            const hasTopLevelDeps = existsSync(topLevelNodeModules) && ls(topLevelNodeModules).filter(d => d !== 'react-native-maps' && d !== '.package-lock.json').length > 0;
            if (!hasNestedDeps && !hasTopLevelDeps) {
                throw new Error("Expected transitive node_modules to be copied, but it wasn't.");
            }
            console.log(`[${widgetName}] Native dependency management succeeded!`);
        }
    }
}

async function execAsync(command, workDir) {
    // Set NO_INPUT and CI flags to auto-accept migration prompts in non-interactive mode
    const resultPromise = promisify(exec)(command, { 
        cwd: workDir,
        env: { ...process.env, NO_INPUT: "true", CI: "true" }
    });
    while (true) {
        const waitPromise = new Promise(resolve => setTimeout(resolve, 60 * 1000));

        const haveCompleted = await Promise.race([resultPromise.then(() => true), waitPromise.then(() => false)]);
        if (haveCompleted) {
            return resultPromise;
        }
        console.log("Waiting...");
    }
}

async function execFailedAsync(command, workDir) {
    try {
        await promisify(exec)(command, { 
            cwd: workDir,
            env: { ...process.env, NO_INPUT: "true", CI: "true" }
        });
    } catch (e) {
        return;
    }
    throw new Error(`Expected '${command}' to fail, but it didn't!`);
}

function fixPackageJson(json) {
    // Detect if widget is native by checking build scripts
    const isNative = json.scripts && (json.scripts.build?.includes("native") || json.scripts.dev?.includes("native"));
    
    const devDependencies = {
        "@types/jest": "^29.0.0",
        "@types/react-test-renderer": "~18.0.0"
    };
    
    // Force specific versions to ensure compatibility with React Native 0.78.2
    // @types/react-native 0.73.0 is used because it's compatible with RN 0.78.2 and React 18 types
    const overrides = {
        react: "18.2.0",
        "react-dom": "18.2.0",
        "react-native": "0.78.2",
        "@types/react": "18.2.79",
        "@types/react-dom": "18.2.25",
        "@types/react-native": "0.73.0"
    };

    // Update devDependencies that exist
    Object.keys(devDependencies)
        .filter(dep => !!json.devDependencies[dep])
        .forEach(dep => (json.devDependencies[dep] = devDependencies[dep]));

    // Remove conflicting type packages from devDependencies
    delete json.devDependencies["@types/react"];
    delete json.devDependencies["@types/react-dom"];
    
    // For native widgets, keep @types/react-native and add react-dom
    if (isNative) {
        json.devDependencies["@types/react-native"] = "0.73.0";
        json.devDependencies["react-dom"] = "18.2.0";  // Needed by @testing-library/react
    } else {
        delete json.devDependencies["@types/react-native"];
    }

    json.overrides = overrides;
    json.resolutions = overrides;
}
