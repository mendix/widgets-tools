/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { existsSync, readdirSync, promises as fs, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { config } from "dotenv";
import colors from "ansi-colors";

config({ path: join(process.cwd(), ".env") });

export async function listDir(path) {
    const entries = await fs.readdir(path, { withFileTypes: true });
    return entries
        .filter(e => e.isFile())
        .map(e => join(path, e.name))
        .concat(...(await Promise.all(entries.filter(e => e.isDirectory()).map(e => listDir(join(path, e.name))))));
}

export const sourcePath = process.cwd();

const widgetPackageJson = JSON.parse(readFileSync(join(sourcePath, "package.json")))
export const widgetName = widgetPackageJson.widgetName;
export const widgetPackage = widgetPackageJson.packagePath;
export const widgetVersion = widgetPackageJson.version;
if (!widgetName || !widgetPackageJson) {
    throw new Error("Widget does not define widgetName in its package.json");
}

const widgetSrcFiles = readdirSync(join(sourcePath, "src")).map(file => join(sourcePath, "src", file));
export const widgetEntry = widgetSrcFiles.filter(file =>
    file.match(new RegExp(`[/\\\\]${escape(widgetName)}\\.[jt]sx?$`, "i"))
)[0];
if (!widgetEntry) {
    throw new Error("Cannot find a widget entry file");
}

export const editorConfigEntry = widgetSrcFiles.filter(file =>
    file.match(new RegExp(`[/\\\\]${escape(widgetName)}\\.editorConfig\\.[jt]s$`, "i"))
)[0];
export const previewEntry = widgetSrcFiles.filter(file =>
    file.match(new RegExp(`[/\\\\]${escape(widgetName)}\\.(webmodeler|editorPreview)\\.[jt]sx?$`, "i"))
)[0];

export const isTypescript = [widgetEntry, editorConfigEntry, previewEntry].some(file => file && /\.tsx?$/.test(file));

export const projectPath = [
    process.env.MX_PROJECT_PATH,
    widgetPackageJson.config.projectPath,
    join(sourcePath, "tests/testProject")
].filter(path => path && existsSync(path))[0];

export const onwarn = (args) => (warning, warn) => {
    // Module level directives is ignored by Rollup since it causes error when bundled.
    // And to not pollute the terminal, the warning code "MODULE_LEVEL_DIRECTIVE" and "SOURCEMAP_ERROR"
    // should be ignored and handled separetely from the safe warning list.
    if (warning.code === "MODULE_LEVEL_DIRECTIVE" || warning.code === "SOURCEMAP_ERROR") return;

    // Many rollup warnings are indication of some critical issue, so we should treat them as errors,
    // except a short white-list which we know is safe _and_ not easily fixable.
    const safeWarnings = ["CIRCULAR_DEPENDENCY", "THIS_IS_UNDEFINED", "UNUSED_EXTERNAL_IMPORT"];
    if (args.watch || safeWarnings.includes(warning.code)) {
        return warn(warning);
    }

    const error =
        (warning.plugin ? `(${warning.plugin} plugin) ` : "") +
        (warning.loc
            ? `${relative(sourcePath, warning.loc.file)} (${warning.loc.line}:${warning.loc.column}) `
            : "") +
        `Error: ${warning.message}` +
        (warning.frame ? warning.frame : "");

    console.error(colors.red(error));
    process.exit(1);
}

function escape(str) {
    return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
}

