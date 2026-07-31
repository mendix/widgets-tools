import { join } from "node:path";
import { readFile } from "node:fs/promises";
import { isVersionString, Version, type VersionString } from "./version.ts";
// FIXME: Uncomment when md parser is 100% ready.
// Disable changelog parser for now
// import { ChangelogFileWrapper } from "./changelog-parser";

interface PackageJsonFileContent {
    name?: string;
    version?: VersionString;

    repository?: {
        type: "git";
        url: string;
    };

    packagePath?: string;
}

export interface PackageInfo {
    packageName: string;
    packageFullName: string;

    version: Version;

    repositoryUrl: string;

    changelog: string;
}

async function readPackageJSON(filePath: string): Promise<PackageJsonFileContent> {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw);
}

export async function getPackageInfo(path: string): Promise<PackageInfo> {
    const pkgPath = join(path, `package.json`);
    try {
        const { name, version, repository } = await readPackageJSON(pkgPath);
        return {
            packageName: ensureString(name, "name"),
            packageFullName: "",
            version: ensureVersion(version),

            repositoryUrl: ensureString(repository?.url, "repository.url"),

            // FIXME: Uncomment when md parser is 100% ready.
            // changelog: ChangelogFileWrapper.fromFile(`${path}/CHANGELOG.md`)
            changelog: "[Parsed Changelog]"
        };
    } catch (error) {
        console.log(error);
        console.error(`ERROR: Path does not exist: ${pkgPath}`);
        throw new Error("Error while reading package info at " + path);
    }
}

function ensureString(str: string | undefined, fieldName: string): string {
    if (typeof str === "undefined") {
        throw new Error(`Expected to be string got undefined for '${fieldName}'`);
    }

    return str;
}

function ensureVersion(version: string | undefined): Version {
    if (isVersionString(version)) {
        return Version.fromString(version);
    }

    throw new Error(`Unknown version format, cant parse: '${version}'`);
}
