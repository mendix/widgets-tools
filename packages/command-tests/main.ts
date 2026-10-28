#! /usr/bin/env node --experimental-strip-types
import { Mutex, Semaphore } from "async-mutex";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "readline/promises";
import { isDefined, type Option } from "./lib/option.ts";
import { getWidgetLogger, styled } from "./lib/logger.ts";
import { type WidgetConfig, getWidgetName } from "./lib/widget.ts";
import { repeat } from "./lib/strings.ts";
import { runTest } from "./tests/testRunner.ts";
import { ensureError } from "./lib/errors.ts";
import { parseArgs } from "node:util";
import { cleanTemporaryFiles, getTempDir } from "./lib/temp.ts";
import { getWidgetGeneratorPath, getWidgetsToolsPackagePath } from "./lib/packages.ts";

const LIMIT_TESTS = !!process.env.LIMIT_TESTS;
const PARALLELISM = 4;

const DIR_COMMAND_TESTS = dirname(fileURLToPath(import.meta.url));

const CONFIGS: WidgetConfig[] = [
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

const readline = createInterface(process.stdin, process.stdout);
const yeomanMutex = new Mutex();

const { values: options } = parseArgs({
    options: {
        "pluggable-widgets-tools": {
            type: "string"
        },
        "generator-widget": {
            type: "string"
        },
        filter: {
            type: "string"
        },
        clean: {
            type: "boolean"
        }
    }
});

main(options)
    .catch(e => {
        console.error(e);
        process.exitCode = 1;
    })
    .finally(async () => {
        if (
            !readline.terminal || // If non-interactive, just clean up without asking.
            !!options.clean ||
            /^y?e?s?$/i.test(await readline.question(styled`${"cyan"}Clean up test widgets? ${"gray"}(YES/no)`))
        ) {
            await cleanTemporaryFiles();
        } else {
            console.log("Leaving temporary files");
        }
        readline.close();
    });

interface CommandTestOptions {
    "pluggable-widgets-tools"?: Option<string>;
    "generator-widget"?: Option<string>;
    filter?: Option<string>;
}

async function main(options: CommandTestOptions) {
    console.log("Preparing...");

    const widgetsToolsPackagePath = await getWidgetsToolsPackagePath(
        DIR_COMMAND_TESTS,
        options["pluggable-widgets-tools"]
    );
    const widgetGeneratorPath = await getWidgetGeneratorPath(DIR_COMMAND_TESTS, options["generator-widget"]);

    let configsToTest = CONFIGS;
    if (isDefined(options.filter)) {
        const parsed = options.filter.split(",");
        configsToTest = CONFIGS.filter((config: string[]) => parsed.every(option => config.includes(option)));
        console.log(
            styled`${"gray"}Preparing: Filter applied, running %d/%d test cases`,
            configsToTest.length,
            CONFIGS.length
        );
    }

    const workDirs: string[] = [];
    const configWorkDirs: Record<string, WidgetConfig> = {};
    const workDirSemaphore = new Semaphore(PARALLELISM);
    const failures: Array<{ config: WidgetConfig; error: Error; workDir: string }> = (
        await Promise.all(
            configsToTest.map(async (config, index) => {
                const logger = getWidgetLogger(index, ...config);
                logger("Scheduled, waiting for lock");
                const [, release] = await workDirSemaphore.acquire();
                let workDir;
                try {
                    workDir = workDirs.pop();
                    if (!workDir) {
                        workDir = await getTempDir(index === 0 ? "spaced folder" : undefined);
                    }
                    configWorkDirs[workDir] = config;
                    await runTest(config, {
                        logger,
                        yeomanMutex,
                        workDir,
                        widgetsToolsPackagePath,
                        widgetGeneratorPath,
                        isShortRun: LIMIT_TESTS,
                        commandTestsDir: DIR_COMMAND_TESTS
                    });
                    workDirs.push(workDir);
                    return undefined;
                } catch (e) {
                    logger(styled`${["bold", "red"]}Stopped with error`);
                    const error = ensureError(e);
                    error
                        .toString()
                        .split("\n")
                        .forEach(l => logger(styled`${"red"}%s`, l));
                    logger(styled`${["bold", "red"]} Widget Directory %s`, workDir);
                    return { config, error, workDir: workDir ?? "<no-directory>" };
                } finally {
                    release();
                }
            })
        )
    ).filter(isDefined);

    console.log(
        styled`\nFinished Testing: ${["bold", failures.length > 0 ? "red" : "green"]}%d Failed, ${["bold", "green"]}%d Successful`,
        failures.length,
        configsToTest.length - failures.length
    );

    console.log(styled`${"green"}\nCreated %d temporary widget directories during testing`, workDirs.length);
    let maxDirLength = 0,
        maxNameLength = 0;
    Object.entries(configWorkDirs)
        .map(([dir, config]) => {
            const name = getWidgetName(...config);
            maxDirLength = Math.max(maxDirLength, dir.length);
            maxNameLength = Math.max(maxNameLength, name.length);
            return [dir, name];
        })
        .forEach(([dir, name]) =>
            console.log(
                "  %s  %s  %s",
                dir + repeat(" ", maxDirLength - dir.length),
                name + repeat(" ", maxNameLength - name.length),
                failures.some(f => f.workDir === dir) ? styled`${["bold", "red"]}❌ Error` : ""
            )
        );

    console.log(styled`\n${["bold", "green"]}All done!`);
}
