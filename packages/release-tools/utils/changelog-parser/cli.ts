#!/usr/bin/env node --experimental-strip-types
import { ChangelogFileWrapper } from "./index.ts";
import { resolve } from "node:path";
import * as process from "node:process";

function reformat(filePath: string): void {
    const changelog = ChangelogFileWrapper.fromFile(filePath);
    changelog.save();
    console.log("Finished formatting %s", filePath);
}

function main(): void {
    try {
        switch (process.argv[2]) {
            case "reformat":
                return reformat(resolve(process.argv[3]));
        }
    } catch (e) {
        console.error(e);
        process.exit();
    }
}

main();
