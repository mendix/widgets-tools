import { existsSync, mkdirSync, writeFileSync } from "fs";
import { EOL } from "os";
import { join } from "path";
import fg from "fast-glob";
import shelljs from "shelljs";
import { zip } from "zip-a-folder";
import { LICENSE_GLOB } from "../common/glob.mjs";

const { cp } = shelljs;

export async function copyLicenseFile(sourcePath, outDir) {
    const absolutePath = join(sourcePath, LICENSE_GLOB);
    const licenseFile = (await fg([absolutePath], { cwd: sourcePath, caseSensitiveMatch: false }))[0];
    if (existsSync(licenseFile)) {
        cp(licenseFile, outDir);
    }
}

export async function createMpkFile({ mpkDir, mpkFile, widgetTmpDir, mxProjectPath, deploymentPath }) {
    mkdirSync(mpkDir, { recursive: true });
    await zip(widgetTmpDir, mpkFile);
    if (mxProjectPath) {
        const widgetsPath = join(mxProjectPath, "widgets");
        const absolutePath = join(mxProjectPath, deploymentPath);
        // Create folder if they do not exists or directories were cleaned
        mkdirSync(widgetsPath, { recursive: true });
        mkdirSync(absolutePath, { recursive: true });
        // Copy files to deployment and widgets folder
        cp("-r", join(widgetTmpDir, "*"), absolutePath);
        cp(mpkFile, widgetsPath);
    }
}

export const licenseCustomTemplate = dependencies =>
    JSON.stringify(
        dependencies.map(dependency => ({
            [dependency.name]: {
                version: dependency.version,
                ...(typeof dependency.isTransitive !== "undefined" ? { transitive: dependency.isTransitive } : null),
                url: dependency.homepage
            }
        }))
    );

const licenseTextTemplate = dependencies =>
    dependencies.length === 0
        ? "No third parties dependencies"
        : dependencies.map(dependency => dependency.text()).join(`${EOL}${EOL}---${EOL}${EOL}`);

/**
 * Every bundle of a widget ships in the same MPK, but each bundle gets its own rollup-plugin-license
 * instance. Pass the returned function as `thirdParty.output` of each instance: it merges what every
 * bundle found and rewrites dependencies.txt and dependencies.json, so the last bundle leaves the
 * complete list.
 */
export function createDependenciesCollector(outDir) {
    const collected = new Map();
    return dependencies => {
        for (const dependency of dependencies) {
            const key = `${dependency.name}@${dependency.version}`;
            if (!collected.has(key)) {
                collected.set(key, dependency);
            }
        }
        const all = [...collected.values()];
        mkdirSync(outDir, { recursive: true });
        writeFileSync(join(outDir, "dependencies.txt"), licenseTextTemplate(all).trim());
        writeFileSync(join(outDir, "dependencies.json"), licenseCustomTemplate(all));
    };
}
