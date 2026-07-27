import { exec } from "node:child_process";
import { promisify } from "node:util";
import { type Logger } from "./logger.ts";

export async function execAsync(command: string, workDir: string, logger: Logger) {
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

export async function execFailedAsync(command: string, workDir: string) {
    try {
        await promisify(exec)(command, { cwd: workDir });
        // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    } catch (_) {
        return;
    }
    throw new Error(`Expected '${command}' to fail, but it didn't!`);
}
