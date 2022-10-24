import { join } from "path";
import { access } from "fs/promises";
import { Version, VersionString } from "./version";
// FIXME: Uncomment when md parser is 100% ready.
// Disable changelog parser for now
// import { ChangelogFileWrapper } from "./changelog-parser";

export interface PackageJsonFileContent {
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


export async function getPackageFileContent(dirPath: string): Promise<PackageJsonFileContent> {
    const pkgPath = join(dirPath, `package.json`);
    try {
        await access(pkgPath);
        const result = (await import(pkgPath)) as PackageJsonFileContent;
        return result;
    } catch (error) {
        console.log(error);
        console.error(`ERROR: Path does not exist: ${pkgPath}`);
        throw new Error("Error while reading package info at " + dirPath);
    }
}

export async function getPackageInfo(path: string): Promise<PackageInfo> {
    const pkgPath = join(path, `package.json`);
    try {
        await access(pkgPath);
        const { name, version, repository } = (await import(pkgPath)) as PackageJsonFileContent;
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

function ensureVersion(version: VersionString | undefined): Version {
    if (version && /\d+\.\d+\.\d+/.test(version)) {
        return Version.fromString(version);
    }

    throw new Error(`Unknown version format, cant parse: '${version}'`);
}
