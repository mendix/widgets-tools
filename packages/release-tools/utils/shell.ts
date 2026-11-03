import { exec } from "node:child_process";
import { ArgumentError } from "./errors.ts";
import { argv } from "node:process";

export function execShellCommand(cmd: string | string[], workingDirectory: string = process.cwd()): Promise<string> {
    const command = Array.isArray(cmd) ? cmd.join(" && ") : cmd;
    return new Promise<string>((resolve, reject) => {
        exec(command, { cwd: workingDirectory }, (error, stdout, stderr) => {
            if (error) {
                console.warn(stderr);
                console.warn(stdout);
                reject(error);
            }
            if (stderr) {
                console.warn(stderr);
            }
            resolve(stdout);
        });
    });
}

export function parseArgument<T>(name: string, position: number, parser: (input: string) => T) {
    const value = argv[position];
    if (!value) {
        throw new ArgumentError(name, value, "Cannot be empty");
    }
    try {
        return parser(value);
    } catch (e) {
        if (e instanceof Error) {
            throw new ArgumentError(name, value, e.message);
        }
        if (typeof e === "string") {
            throw new ArgumentError(name, value, e);
        }
        console.error(e);
        throw new ArgumentError(name, value);
    }
}
