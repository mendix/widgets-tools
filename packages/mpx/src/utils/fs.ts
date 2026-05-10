import { ConsolaInstance } from "consola";
import fg from "fast-glob";
import assert from "node:assert";
import fs from "node:fs/promises";
import path from "node:path";
import { BuildOptions } from "rolldown";
import { bold, green } from "./colors.js";
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

export async function deployToMxProject(
    config: ProjectConfig,
    projectPath: string,
    deploymentPath: string[]
): Promise<void> {
    const mpkDst = path.join(projectPath, "widgets");
    const deploymentDir = path.join(projectPath, "deployment", "web", "widgets");

    // Get the list of files in contentRoot
    const files = await fs.readdir(config.outputDirs.contentRoot, { withFileTypes: true });

    // Copy directories from contentRoot to deploymentDir
    for (const file of files.filter(file => file.isDirectory())) {
        const src = path.join(config.outputDirs.contentRoot, file.name);
        const dst = path.join(deploymentDir, file.name);
        await fs.cp(src, dst, { recursive: true, force: true });
    }
    // Copy MPK file to widgets directory
    await fs.mkdir(mpkDst, { recursive: true });
    await fs.cp(config.outputDirs.mpkDir, mpkDst, { recursive: true, force: true });
}

type ConfigFactory = (args: { configDefaultConfig: BuildOptions[] }) => Promise<BuildOptions[]>;

export async function loadCustomConfigFactory(logger: ConsolaInstance): Promise<ConfigFactory | null> {
    const [configFile] = await fg(["rollup.config.{js,mjs}"]);
    if (configFile) {
        logger.info(formatMsg.usingCustomConfig());
        const { default: customConfig } = await import(path.resolve(configFile));
        assert(
            typeof customConfig === "function",
            `Rollup config error: expected default export to be a function, got ${typeof customConfig}`
        );

        return customConfig;
    }
    return null;
}

const formatMsg = {
    usingCustomConfig: () => green(bold(`Loading custom rollup config...`))
};
