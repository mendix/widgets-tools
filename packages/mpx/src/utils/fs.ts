import fs from "node:fs/promises";
import path from "node:path";
import { parsePackageError } from "./error.js";
import { PackageJson } from "./parsers/PackageJson.js";
import { ProjectConfig } from "./project-config.js";

export function access(filePath: string): Promise<boolean> {
    return fs.access(filePath, fs.constants.F_OK).then(
        () => true,
        () => false
    );
}

export async function isTypeScriptProject(root: string): Promise<boolean> {
    return access(path.resolve(root, "tsconfig.json"));
}

export async function hasEditorConfig(project: ProjectConfig): Promise<boolean> {
    return access(path.resolve(project.inputFiles.editorConfig));
}

export async function hasEditorPreview(project: ProjectConfig): Promise<boolean> {
    return access(path.resolve(project.inputFiles.editorPreview));
}

export async function readPackageJson(root: string): Promise<PackageJson> {
    const filePath = path.resolve(root, "package.json");
    try {
        return PackageJson.parse(JSON.parse(await fs.readFile(filePath, "utf-8")));
    } catch (error) {
        throw parsePackageError(error);
    }
}
