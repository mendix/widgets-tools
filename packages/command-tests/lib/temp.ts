import shelljs from "shelljs";
import { isDefined, type Option } from "./option.ts";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { mkdir, rm } from "node:fs/promises";
import { styled } from "./logger.ts";

const { tempdir } = shelljs;

const temporaryPaths: string[] = [];

export function markPathTemporary(path: string) {
    temporaryPaths.push(path);
}

export async function cleanTemporaryFiles(): Promise<void> {
    console.log(styled`${"gray"}Cleaning %d temporary paths`, temporaryPaths.length);
    await Promise.all(temporaryPaths.map(path => rm(path, { recursive: true, force: true })));
}

export async function getTempDir(name?: string) {
    const temp = tempdir();
    let dir: Option<string>;
    while (!isDefined(dir) || existsSync(dir)) {
        dir = join(temp, ["pwt_test", name, Math.floor(Math.random() * 10000)].filter(isDefined).join("_"));
    }
    await mkdir(dir, { recursive: true });
    markPathTemporary(dir);
    return dir;
}
