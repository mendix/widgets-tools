#! /usr/bin/env node
const { execSync, spawnSync } = require("child_process");
const { existsSync } = require("fs");
const { delimiter, dirname, join, parse } = require("path");
const { checkMigration } = require("../utils/migration");
const { checkForEnzymeUsage } = require("../dist/utils/enzyme-detector");
const { red, blue, bold, whiteBright } = require("ansi-colors");
const semver = require("semver");
const { auditPluggableWidgetsTools } = require("../dist/commands/audit");

checkNodeVersion();
(async () => {
    try {
        await checkMigration();
    } catch (e) {
        console.log(red("An error occurred while checking migration dependencies: ", e));
    }

    const [, currentScriptPath, cmd, ...args] = process.argv;
    const toolsRoot = currentScriptPath.endsWith("pluggable-widgets-tools")
        ? join(dirname(currentScriptPath), "../@mendix/pluggable-widgets-tools")
        : join(dirname(currentScriptPath), "..");

    if (args.indexOf("--subprojectPath") > -1) {
        args.splice(args.indexOf("--subprojectPath"), 2);
    }

    if (cmd && cmd.startsWith("test:unit")) {
        checkForEnzymeUsage();
    }

    const realCommand = getRealCommand(cmd, toolsRoot);
    console.log(`\nRunning MX Widgets Tools script ${blue(cmd)}...\n`);

    if (typeof realCommand === "function") {
        try {
            await realCommand();
            process.exit(0);
        } catch (e) {
            console.log(red("An error occurred while running %s: %s"), cmd, e);
            process.exit(1);
        }
    }

    const nodeModulesBins = findNodeModulesBin();
    const commandWithArgs = realCommand + " " + args.join(" ");
    for (const subCommand of commandWithArgs.split(/&&/g)) {
        const result = spawnSync(subCommand.trim(), [], {
            cwd: process.cwd(),
            env: {
                ...process.env,
                PATH: [process.env.PATH].concat(nodeModulesBins).join(delimiter),
                // Hack for Windows using NTFS Filesystem, we cannot add platform specific check otherwise GitBash or other linux based terminal on windows will also fail.
                Path: [process.env.Path].concat(nodeModulesBins).join(delimiter),
                // ESLint 9 compatibility: use legacy config format until flat config migration is complete
                ESLINT_USE_FLAT_CONFIG: "false"
            },
            shell: true,
            stdio: "inherit"
        });
        if (result.status !== 0) {
            process.exit(result.status);
        }
    }
})();

function getRealCommand(cmd, toolsRoot) {
    const eslintCommand = "eslint --config .eslintrc.js --ext .jsx,.js,.ts,.tsx src";
    const prettierConfigRootPath = join(__dirname, "../../../prettier.config.js");
    const prettierConfigPath = existsSync(prettierConfigRootPath) ? prettierConfigRootPath : "prettier.config.js";
    const prettierCommand = `prettier --config "${prettierConfigPath}" "{src,typings,tests}/**/*.{js,jsx,ts,tsx,scss}"`;
    const rollupCommandWeb = `rollup --config "${join(toolsRoot, "configs/rollup.config.mjs")}"`;
    const rollupCommandNative = `rollup --config "${join(toolsRoot, "configs/rollup.config.native.mjs")}"`;

    switch (cmd) {
        case "start:web":
        case "start:server":
        case "dev:js":
        case "dev:ts":
            return `${rollupCommandWeb} --watch`;
        case "start:native":
        case "start:js:native":
        case "start:ts:native":
        case "dev:js:native":
        case "dev:ts:native":
            return `${rollupCommandNative} --watch`;
        case "build:web":
        case "build:js":
        case "build:ts":
            return `${rollupCommandWeb}`;
        case "build:native":
        case "build:js:native":
        case "build:ts:native":
            return `${rollupCommandNative}`;
        case "release:web":
        case "release:js":
        case "release:ts":
            return `${rollupCommandWeb} --configProduction`;
        case "release:native":
        case "release:js:native":
        case "release:ts:native":
            return `${rollupCommandNative} --configProduction`;
        case "lint":
            return `${prettierCommand} --check && ${eslintCommand}`;
        case "lint:fix":
            return `${prettierCommand} --write && ${eslintCommand} --fix`;
        case "format":
            return `${prettierCommand} --write`;
        case "test:unit":
        case "test:unit:web":
            return `jest --projects "${join(toolsRoot, "test-config/jest.config.js")}"`;
        case "test:unit:native":
            return `jest --projects "${join(toolsRoot, "test-config/jest.native.config.js")}"`;
        case "audit":
            return auditPluggableWidgetsTools;
        case "audit:fix":
            return () => auditPluggableWidgetsTools(true);
        case "test:e2e":
        case "test:e2e:ts":
        case "test:e2e:web:cypress":
        case "test:e2e:web:cypress:local":
        case "test:unit:web:enzyme-free":
            return "echo This command has been removed, use test:unit:web instead!";
        case "start:js":
        case "start:ts":
            return "echo This command has no effect, use pluggable-widgets-tools start:web instead!";
        default:
            console.error(`Unknown command passed to MX Widgets Tools script: '${cmd}'`);
            process.exit(1);
    }
}

function findNodeModulesBin() {
    let parentDir = join(__dirname, "..");
    const bins = [];
    while (parse(parentDir).root !== parentDir) {
        const candidate = join(parentDir, "node_modules/.bin");
        if (existsSync(candidate)) {
            bins.push(candidate);
        }
        parentDir = join(parentDir, "..");
    }
    if (bins.length === 0) {
        throw new Error("Cannot find bin folder");
    }
    return bins;
}

function checkNodeVersion() {
    const packageJson = require(join(__dirname, "../package.json"));
    const nodeRange = new semver.Range(packageJson.engines.node);

    console.log("Checking node and npm version...");
    try {
        const nodeVersion = execSync("node --version").toString().trim();
        const npmVersion = extractMajorVersion(execSync("npm --version").toString().trim());
        if (!nodeRange.test(nodeVersion)) {
            console.error(
                red(`To build this widget a minimum node version ${nodeRange} is required.\n`) +
                    bold(whiteBright("Please upgrade your node version!"))
            );
            process.exit(1);
        }
        if (npmVersion < 8) {
            console.error(
                red("To build this widget a minimum npm version 8.0.0 is required.\n") +
                    bold(whiteBright("Please upgrade your npm version!"))
            );
            process.exit(1);
        }
    } catch (e) {
        throw new Error("Cannot find node or npm to determine the version:", { cause: e });
    }
}

function extractMajorVersion(version) {
    const majorVersion = version.replace(/^\D+/, "").split(".")[0];
    return Number(majorVersion);
}
