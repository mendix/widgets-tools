import shelljs from "shelljs";
import kill from "tree-kill";
import { type Config, getWidgetName } from "../lib/config.ts";
import { type Logger } from "../lib/logger.ts";
import { join } from "node:path";
import { resolveModule } from "../lib/node.ts";
import fsExtra from "fs-extra";
import { execAsync, execFailedAsync } from "../lib/exec.ts";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { Mutex } from "async-mutex";
import helpers from "yeoman-test";

const { copy, existsSync, readFileSync, readJson, writeFileSync, writeJson } = fsExtra;
const { ls, rm } = shelljs;

export async function runTest(
    config: Config,
    {
        logger,
        yeomanMutex,
        workDir,
        commandTestsDir,
        widgetsToolsPackagePath,
        isShortRun
    }: {
        logger: Logger;
        yeomanMutex: Mutex;
        workDir: string;
        isShortRun: boolean;
        commandTestsDir: string;
        widgetsToolsPackagePath: string;
    }
) {
    const [platform, boilerplate, lang, version] = config;
    const isNative = platform === "native";
    const widgetName = getWidgetName(platform, boilerplate, lang, version);
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    let widgetPackageJson: any;

    logger(`Preparing widget...`);
    await prepareWidget();
    logger(`Ready to test!`);

    logger(`Testing linting...`);
    await testLint();

    // Temporarily disabled due to bizarre typing issues in the CI that cannot be reproduced in any local environment
    logger(`Testing unit tests....`);
    await testTest();

    if (isShortRun) {
        logger(`Quick tested!`);
        return;
    }

    logger(`Testing 'build' command...`);
    await testBuild();

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
                    .run();
                await copy(join(generatedWidget.cwd, "generated"), workDir);
            } finally {
                release();
            }
        } else {
            await copy(join(commandTestsDir, "projects", widgetName), workDir);
        }

        logger("Preparing widget: Installing");
        widgetPackageJson = await readJson(join(workDir, "package.json"));
        widgetPackageJson.devDependencies["@mendix/pluggable-widgets-tools"] = widgetsToolsPackagePath;

        await writeJson(join(workDir, "package.json"), widgetPackageJson);

        await execAsync("npm install --loglevel=error", workDir, logger);
    }

    async function testLint() {
        await execFailedAsync("npm run lint", workDir);
        await execAsync("npm run lint:fix", workDir, logger);
        await execAsync("npm run lint", workDir, logger);
    }

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
        checkWidgetBundleFiles();
    }

    async function testRelease() {
        rm("-rf", join(workDir, "dist"));
        await execAsync("npm run release", workDir, logger);
        checkWidgetBundleFiles();
    }

    function checkWidgetBundleFiles() {
        const stagingDir = join(workDir, "dist", "tmp", "widgets");
        const mpkFile = join(
            workDir,
            "dist",
            widgetPackageJson.version,
            `${widgetPackageJson.packagePath}.${widgetPackageJson.widgetName}.mpk`
        );
        const requiredFiles = [
            mpkFile,
            join(stagingDir, "package.xml"),
            join(stagingDir, `${widgetPackageJson.widgetName}.xml`)
        ];
        const missing = requiredFiles.filter(f => !existsSync(f));
        if (missing.length) {
            throw new Error(`Expected widget bundle files in mpk, but missing: ${missing.join(", ")}.`);
        }
    }

    async function checkDependenciesFiles(isNative: boolean, boilerplate: Config[1], version: Config[3]) {
        const dependenciesJSONFile = join(workDir, "dist", "tmp", "widgets", "dependencies.json");
        const dependenciesTxtFile = join(workDir, "dist", "tmp", "widgets", "dependencies.txt");

        if (!existsSync(dependenciesJSONFile) || !existsSync(dependenciesTxtFile)) {
            throw new Error("Expected dependencies files to be generated, but it wasn't.");
        }

        type Dependency = { [packageName: string]: { version: string; url: string | null } };
        const dependenciesJSON: Dependency[] = JSON.parse(readFileSync(dependenciesJSONFile, "utf8"));
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
            (!dependenciesJSON.some(dependency => Object.keys(dependency).includes(packageName)) ||
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
            await new Promise<void>((resolve, reject) => {
                let inProgress = false;
                startProcess.stdout?.on("data", onOutput);
                startProcess.stderr?.on("data", onOutput);
                startProcess.on("exit", exitCode => {
                    reject(new Error(`Exited with status ${exitCode}`));
                });
                // eslint-disable-next-line  @typescript-eslint/no-explicit-any
                function onOutput(data: any) {
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
            if (startProcess.pid !== undefined) {
                try {
                    await promisify((pid: number, signal: string, callback: (e?: Error) => void) =>
                        kill(pid, signal, callback)
                    )(startProcess.pid, "SIGKILL");
                } catch (e) {
                    throw new Error("Unable to kill `start` process", { cause: e });
                }
                logger("Waiting for process to terminate");
                await new Promise(resolve => setTimeout(resolve, 5000)); // give time for processes to die
            }
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
        if (!existsSync(join(workDir, `/dist/tmp/widgets/node_modules/react-native-maps/node_modules/prop-types`))) {
            throw new Error("Expected transitive node_modules to be copied, but it wasn't.");
        }
        logger(`Native dependency management succeeded!`);
    }
}
