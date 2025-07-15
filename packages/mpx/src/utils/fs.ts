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

export async function hasEditorConfig(config: ProjectConfig): Promise<boolean> {
    return access(path.resolve(config.inputFiles.editorConfig));
}

export async function hasEditorPreview(config: ProjectConfig): Promise<boolean> {
    return access(path.resolve(config.inputFiles.editorPreview));
}

export async function readPackageJson(root: string): Promise<PackageJson> {
    const filePath = path.resolve(root, "package.json");
    try {
        return PackageJson.parse(JSON.parse(await fs.readFile(filePath, "utf-8")));
    } catch (error) {
        throw parsePackageError(error);
    }
}

export async function deployToMxProject(config: ProjectConfig, projectPath: string): Promise<void> {
    const mpkDst = path.join(projectPath, "widgets");
    const widgetDst = path.join(projectPath, "deployment", "web", "widgets", config.relativeWidgetPath);

    await fs.mkdir(widgetDst, { recursive: true });
    await fs.mkdir(mpkDst, { recursive: true });
    // Copy widget assets to deployment
    // Note: in pwt we copy all files (including xml) which probably not needed
    await fs.cp(config.outputDirs.widgetDir, widgetDst, { recursive: true, force: true });
    // Copy mpk to "widgets" directory
    await fs.cp(config.outputDirs.mpkDir, mpkDst, { recursive: true, force: true });
}
