import { exec } from "node:child_process";

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
