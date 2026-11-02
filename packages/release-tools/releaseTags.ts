#! /usr/bin/env -S node --experimental-strip-types
import { exec } from "node:child_process";
import { format, promisify } from "node:util";
import { parse, gt } from "semver";
import { handleError } from "./utils/errors.ts";
import { parseArgument } from "./utils/shell.ts";
import { ensure } from "./utils/assertions.ts";

const RELEASEABLE_PACKAGES = ["@mendix/pluggable-widgets-tools", "@mendix/generator-widget"] as const;

async function main() {
    const releasePackage = parseArgument("package name", 2, input =>
        ensure(
            RELEASEABLE_PACKAGES.find(p => p === input),
            "Unknown package, must be one of " + RELEASEABLE_PACKAGES.join(", ")
        )
    );
    const releaseVersion = parseArgument("release version", 3, input =>
        ensure(parse(input), "Must use the semver format")
    );

    const { stdout } = await promisify(exec)(`npm show ${releasePackage} dist-tags.latest`);
    const latest = parse(stdout.trim());
    if (!latest) {
        throw Error(`Unable to parse latest released version "${stdout}"`);
    }

    const tag = gt(releaseVersion, latest) ? "latest" : `${releaseVersion.major}.${releaseVersion.minor}-latest`;

    console.log(tag);
}

await main().catch(e => {
    handleError(e, format("\nUsage: %s <package-name> <release-version>", process.argv[1]));
    process.exit(1);
});
