import { existsSync } from "node:fs";
import { ensure, isDefined, type Option } from "./option.ts";
import { isAbsolute, join, resolve } from "node:path";
import { execAsync } from "./exec.ts";
import { getTempDir, markPathTemporary } from "./temp.ts";
import { styled } from "./logger.ts";
import { promisify } from "node:util";
import { exec } from "node:child_process";

export async function getWidgetsToolsPackagePath(commandTestDir: string, path: Option<string>) {
    if (isDefined(path)) {
        console.log(styled`${"gray"}Preparing: Using prepackaged @mendix/pluggable-widgets-tools`);
        if (existsSync(path)) {
            return path;
        }
        throw Error(`ArgumentError: Path to @mendix/pluggable-widgets-tools does not exist: ${path}`);
    }

    console.log(styled`${"gray"}Preparing: Packaging @mendix/pluggable-widgets-tools from source`);
    const pluggableWidgetsToolsPath = join(commandTestDir, "../pluggable-widgets-tools");
    if (isAbsolute(pluggableWidgetsToolsPath) && !existsSync(pluggableWidgetsToolsPath)) {
        throw Error(`ArgumentError: Unable to locate package source at '${pluggableWidgetsToolsPath}'`);
    }
    const { stdout: packOutput } = await promisify(exec)("pnpm pack", { cwd: pluggableWidgetsToolsPath });
    const packagePath = join(pluggableWidgetsToolsPath, ensure(packOutput.trim().split(/\n/g).pop()));
    markPathTemporary(packagePath);
    return packagePath;
}

export async function getWidgetGeneratorPath(commandTestDir: string, path: Option<string>) {
    if (!isDefined(path)) {
        console.log(styled`${"gray"}Preparing: Locating @mendix/generator-widget source files`);
        const generatorSourcePath = join(commandTestDir, "../generator-widget/generators/app");
        if (!existsSync(generatorSourcePath)) {
            throw Error(`ArgumentError: Unable to locate package source at '${generatorSourcePath}'`);
        }

        return generatorSourcePath;
    }

    console.log(styled`${"gray"}Preparing: Using prepackaged @mendix/generator-widget`);
    const fullPath = resolve(path);
    if (!existsSync(fullPath)) {
        throw Error(`Prepackaged @mendix/generator-widget does not exist at path: ${fullPath}`);
    }

    const workDir = await getTempDir("generator");
    const { stderr } = await promisify(exec)(`npm install ${fullPath}`, { cwd: workDir });
    const generatorPath = join(workDir, "node_modules/@mendix/generator-widget", "generators/app");
    if (!isDefined(generatorPath)) {
        throw new Error(`Unable to unpack @mendix/generator-widget ${fullPath}:\n${stderr}`);
    }
    return generatorPath;
}
