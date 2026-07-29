#!/usr/bin/env node --experimental-strip-types
import { ChangelogFileWrapper } from "./index.ts";
import { resolve } from "node:path";
import * as process from "node:process";
import { ArgumentError, handleError } from "../errors.ts";
import { format } from "node:util";

function ensureFilePath(filePath: string | undefined) {
    if (!filePath) {
        throw new ArgumentError("filepath", filePath);
    }
    return resolve(filePath);
}

function reformat(filePath: string | undefined): void {
    filePath = ensureFilePath(filePath);
    const changelog = ChangelogFileWrapper.fromFile(filePath);
    changelog.save();
    console.log("Finished formatting %s", filePath);
}

function parse(filePath: string | undefined): void {
    filePath = ensureFilePath(filePath);
    ChangelogFileWrapper.fromFile(filePath);
    console.log("Successfully parsed %s", filePath);
}

function main(): void {
    try {
        switch (process.argv[2]) {
            case "reformat":
                return reformat(process.argv[3]);
            case "parse":
                return parse(process.argv[3]);
            default:
                throw new ArgumentError("command of reformat", process.argv[2]);
        }
    } catch (e) {
        handleError(e, format("Usage: %s\n\treformat <filePath>\n\tparse <filePath>", process.argv[1]));
        process.exit();
    }
}

main();
