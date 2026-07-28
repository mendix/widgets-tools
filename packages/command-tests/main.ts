#! /usr/bin/env node --experimental-strip-types
import { Mutex, Semaphore } from "async-mutex";
import fsExtra from "fs-extra";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import shelljs from "shelljs";
import { createInterface } from "readline/promises";
import { execAsync } from "./lib/exec.ts";
import { ensure, isDefined } from "./lib/option.ts";
import { getWidgetLogger, styled } from "./lib/logger.ts";
import { type Config, getWidgetName } from "./lib/config.ts";
import { repeat } from "./lib/strings.ts";
import { runTest } from "./tests/testRunner.ts";
import { ensureError } from "./lib/errors.ts";

const { readJson } = fsExtra;
const { mkdir, rm, tempdir } = shelljs;

const LIMIT_TESTS = !!process.env.LIMIT_TESTS;
const PARALLELISM = 4;

const DIR_COMMAND_TESTS = dirname(fileURLToPath(import.meta.url));

const CONFIGS: Config[] = [
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

main()
    .catch(e => {
        console.error(e);
        process.exitCode = 1;
    })
    .finally(() => {
        readline.close();
    });

async function main() {
    console.log("Preparing...");

    const pluggableWidgetsToolsPath = join(DIR_COMMAND_TESTS, "../pluggable-widgets-tools");
    const pluggableWidgetsToolsVersion = (await readJson(join(pluggableWidgetsToolsPath, "package.json"))).version;
    console.log("Preparing: Packaging @mendix/pluggable-widgets-tools version %s", pluggableWidgetsToolsVersion);
    const { stdout: packOutput } = await execAsync("npm pack", pluggableWidgetsToolsPath, (m: string) =>
        console.log(m)
    );
    const widgetsToolsPackagePath = join(pluggableWidgetsToolsPath, ensure(packOutput.trim().split(/\n/g).pop()));

    const workDirs: string[] = [];
    const configWorkDirs: Record<string, Config> = {};
    const workDirSemaphore = new Semaphore(PARALLELISM);
    const failures: Array<{ config: Config; error: Error; workDir: string }> = (
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
                    configWorkDirs[workDir] = config;
                    await runTest(config, {
                        logger,
                        yeomanMutex,
                        workDir,
                        widgetsToolsPackagePath,
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
        CONFIGS.length - failures.length
    );

    console.log(styled`${"green"}\nCreated %d temporary directories during testing`, workDirs.length);
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

    if (
        !readline.terminal || // If non-interactive, just clean up without asking.
        /^y?e?s?$/i.test(await readline.question(styled`${"cyan"}Clean up test widgets? ${"gray"}(YES/no)`))
    ) {
        console.log("Cleaning up temporary files");
        try {
            rm("-rf", widgetsToolsPackagePath, ...workDirs);
        } catch (error) {
            console.warn(styled`${"yellow"}Unable to remove temporary files: %s`, ensureError(error).message);
        }
    } else {
        console.log("Leaving temporary files");
    }

    console.log(styled`\n${["bold", "green"]}All done!`);
}
