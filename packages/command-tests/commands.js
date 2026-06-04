import { Mutex, Semaphore } from "async-mutex";
import { exec } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import fsExtra from "fs-extra";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import shelljs from "shelljs";
import kill from "tree-kill";
import { promisify } from "util";
import chalk from "chalk";
import helpers from "yeoman-test";

const { copy, existsSync, readJson, writeJson } = fsExtra;
const { ls, mkdir, rm, tempdir } = shelljs;

const LIMIT_TESTS = !!process.env.LIMIT_TESTS;
const PARALLELISM = 4;

const DIR_COMMAND_TESTS = dirname(fileURLToPath(import.meta.url));

const CONFIGS = [
    ["web", "full", "js", "latest"],
    ["web", "full", "ts", "latest"],
    ["native", "full", "js", "latest"],
    ["native", "full", "ts", "latest"],
    ["web", "empty", "js", "latest"],
    ["web", "empty", "ts", "latest"],
    ["native", "empty", "js", "latest"],
    ["native", "empty", "ts", "latest"]
];

const COLORS = [
    "green",
    "yellow",
    "blue",
    "magenta",
    "cyan",
    "greenBright",
    "yellowBright",
    "blueBright",
    "magentaBright",
    "cyanBright"
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

    const pluggableWidgetsToolsPath = join(DIR_COMMAND_TESTS, "../pluggable-widgets-tools");
    const pluggableWidgetsToolsVersion = (await readJson(join(pluggableWidgetsToolsPath, "package.json"))).version;
    console.log("Preparing: Packaging @mendix/pluggable-widgets-tools version %s", pluggableWidgetsToolsVersion);
    const { stdout: packOutput } = await execAsync("npm pack", pluggableWidgetsToolsPath, m => console.log(m));
    const toolsPackagePath = join(pluggableWidgetsToolsPath, packOutput.trim().split(/\n/g).pop());

    const workDirs = [];
    const workDirSemaphore = new Semaphore(PARALLELISM);
    const failures = (
        await Promise.all(
            CONFIGS.map(async (config, index) => {
                const logger = getWidgetLogger(index, ...config);
                logger("Scheduled, waiting for lock");
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
                    await runTest(workDir, logger, ...config);
                    return undefined;
                } catch (e) {
                    logger(chalk.bold.red("Stopped with error"));
                    return [config, e];
                } finally {
                    workDirs.push(workDir);
                    release();
                }
            })
        )
    ).filter(f => f);

    console.log("Cleaning up temporary files");
    try {
        rm("-rf", toolsPackagePath, ...workDirs);
    } catch (error) {
        console.warn(chalk.yellow(`Unable to remove temporary files: ${error.message}`));
    }

    console.log("All done! Failed: %d Successful: %d", failures.length, CONFIGS.length - failures.length);

    if (failures.length) {
        failures.forEach(f => console.error(chalk.red(`Test for configuration ${f[0]} failed: ${f[1]}`)));
        process.exit(2);
    }

    async function runTest(workDir, logger, platform, boilerplate, lang, version) {
        const isNative = platform === "native";
        const widgetName = getWidgetName(platform, boilerplate, lang, version);
        let widgetPackageJson;

        logger(`Preparing widget...`);
        await prepareWidget();
        logger(`Ready to test!`);

        logger(`Testing linting...`);
        await testLint();

        // Temporarily disabled due to bizarre typing issues in the CI that cannot be reproduced in any local environment
        // logger(`Testing unit tests....`);
        // await testTest();

        if (LIMIT_TESTS) {
            logger(`Quick tested!`);
            return;
        }

        logger(`Testing 'build' command...`);
        await testBuild();

        // Temporarily disabled due to bizarre typing issues in the CI that cannot be reproduced in any local environment
        // logger(`Testing 'test:unit' command...`);
        // await testTestUnit();

        logger(`Testing 'release' command...`);
        await testRelease();

        logger(`Checking dependencies files...`);
        await checkDependenciesFiles(isNative, boilerplate, version);

        logger(`Testing npm start...`);
        await testStart();

        // Check native dependency management
        if (isNative) {
            logger(`Testing native dependency management...`);
            await testNativeDependencyManagement();
        }

        logger(`Tested!`);

        async function prepareWidget() {
            const filesToRemove = ls(workDir)
                .filter(file => file !== "node_modules")
                .map(file => join(workDir, file));

            if (filesToRemove.length) {
                rm("-r", ...filesToRemove);
            }

            if (version === "latest") {
                logger("Preparing widget: Generating");
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
                const release = await yeomanMutex.acquire(); // yeoman generator is no re-entrable :(
                try {
                    const generatedWidget = await helpers
                        .run(resolveModule("@mendix/generator-widget"))
                        .withAnswers(promptAnswers)
                        .withArguments("Generated")
                        .toPromise();
                    await copy(join(generatedWidget.cwd, "generated"), workDir);
                } finally {
                    release();
                }
            } else {
                await copy(join(DIR_COMMAND_TESTS, "projects", widgetName), workDir);
            }

            logger("Preparing widget: Installing");
            widgetPackageJson = await readJson(join(workDir, "package.json"));
            widgetPackageJson.devDependencies["@mendix/pluggable-widgets-tools"] = toolsPackagePath;

            // Adds compatibility to new React 18 and React native 0.72
            fixPackageJson(widgetPackageJson);

            await writeJson(join(workDir, "package.json"), widgetPackageJson);

            await execAsync("npm install --loglevel=error", workDir, logger);
        }

        async function testLint() {
            await execFailedAsync("npm run lint", workDir);
            await execAsync("npm run lint:fix", workDir, logger);
            await execAsync("npm run lint", workDir, logger);
        }

        // eslint-disable-next-line no-unused-vars
        async function testTest() {
            if (platform === "native") {
                await execFailedAsync("npm test -- --forceExit", workDir);
                await execAsync("npm test -- -u --forceExit", workDir, logger);
            } else {
                await execAsync("npm test -- --forceExit", workDir, logger);
            }
        }

        async function testBuild() {
            await execAsync("npm run build", workDir, logger);
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

        // eslint-disable-next-line no-unused-vars
        async function testTestUnit() {
            await execAsync("npm run test:unit -- --forceExit", workDir, logger);
            if (!existsSync(join(workDir, `/dist/coverage/clover.xml`))) {
                throw new Error("Expected coverage file to be generated, but it wasn't.");
            }
        }

        async function testRelease() {
            rm("-rf", join(workDir, "dist"));
            await execAsync("npm run release", workDir, logger);

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
                                    logger(`Start succeeded!`);
                                    resolve();
                                }
                            }, 100);
                        }
                    }
                });
            } finally {
                try {
                    await promisify(kill)(startProcess.pid, "SIGKILL");
                } catch (e) {
                    console.warn(`[${widgetName}] Error while killing start process: ${e}`);
                }
                await new Promise(resolve => setTimeout(resolve, 5000)); // give time for processes to die
            }
        }

        async function testNativeDependencyManagement() {
            const NATIVE_MAPS_VERSION = "0.31.1";
            await execAsync(`npm install react-native-maps@${NATIVE_MAPS_VERSION}`, workDir, logger);
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
            await execAsync("npm run build", workDir, logger);
            if (!existsSync(jsonPath)) {
                throw new Error("Expected dependency json file to be generated, but it wasn't.");
            }
            const dependencyJson = await readJson(jsonPath);
            if (
                !dependencyJson.nativeDependencies ||
                dependencyJson.nativeDependencies["react-native-maps"] !== NATIVE_MAPS_VERSION
            ) {
                throw new Error("Expected dependency json file to contain dependencies, but it wasn't.");
            }
            if (!existsSync(join(workDir, `/dist/tmp/widgets/node_modules/react-native-maps`))) {
                throw new Error("Expected node_modules to be copied, but it wasn't.");
            }
            if (
                !existsSync(join(workDir, `/dist/tmp/widgets/node_modules/react-native-maps/node_modules/prop-types`))
            ) {
                throw new Error("Expected transitive node_modules to be copied, but it wasn't.");
            }
            logger(`Native dependency management succeeded!`);
        }
    }
}

function getWidgetName(platform, boilerplate, lang, version) {
    return `[generated_${version.replace(".", "_")}_${lang}_${platform}_${boilerplate}]`;
}

function getWidgetLogger(index, platform, boilerplate, lang, version) {
    const color = chalk[COLORS[index % COLORS.length]];
    return (...msgs) => console.log(color(getWidgetName(platform, boilerplate, lang, version)), ...msgs);
}

/**
 * Resolves the given module and returns the full path.
 * This corresponds to the "main" or "import" property of a package.json.
 *
 * @example
 * ```js
 * resolve("@mendix/generator-widget") // "/path/to/generator-widget/generators/app/index.js"
 * ```
 */
function resolveModule(packageName) {
    return fileURLToPath(import.meta.resolve(packageName));
}

async function execAsync(command, workDir, logger) {
    const resultPromise = promisify(exec)(command, { cwd: workDir });
    while (true) {
        const waitPromise = new Promise(resolve => setTimeout(resolve, 60 * 1000));

        const haveCompleted = await Promise.race([resultPromise.then(() => true), waitPromise.then(() => false)]);
        if (haveCompleted) {
            return resultPromise;
        }
        logger("Waiting...");
    }
}

async function execFailedAsync(command, workDir) {
    try {
        await promisify(exec)(command, { cwd: workDir });
        // eslint-disable-next-line no-unused-vars
    } catch (_) {
        return;
    }
    throw new Error(`Expected '${command}' to fail, but it didn't!`);
}

function fixPackageJson(json) {
    const devDependencies = {
        "@types/jest": "^29.0.0",
        "@types/react": "^19.0.0",
        "@types/react-native": "0.78.2",
        "@types/react-dom": "^19.0.0",
        "@types/react-test-renderer": "~18.0.0"
    };
    const overrides = {
        react: "^19.0.0",
        "react-dom": "^19.0.0",
        "react-native": "0.78.2"
    };

    Object.keys(devDependencies)
        .filter(dep => !!json.devDependencies[dep])
        .forEach(dep => (json.devDependencies[dep] = devDependencies[dep]));

    json.overrides = overrides;
    json.resolutions = overrides;
}
