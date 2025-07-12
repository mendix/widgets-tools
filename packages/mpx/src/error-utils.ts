import chalk from "chalk";

export function pprint(msg: string) {
    return msg
        .split("\n")
        .map(line => chalk.yellow(line))
        .join("\n");
}
