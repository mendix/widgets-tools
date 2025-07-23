import { ChangelogFileWrapper } from ".";
import { resolve } from "path";
import * as process from "process";

function reformat(filePath: string): void {
    try {
        const changelog = ChangelogFileWrapper.fromFile(filePath);

        changelog.save();
    } catch (e) {
        console.log(e);
        process.exit();
    }
}

function main(): void {
    switch (process.argv[2]) {
        case "reformat":
            return reformat(resolve(process.argv[3]));
    }
}

main();
