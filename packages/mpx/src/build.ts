import fs from "node:fs/promises";
import path from "node:path";
import { env } from "node:process";
import ms from "pretty-ms";
import { BuildOptions, build as buildBundle, watch } from "rolldown";
import { onExit } from "signal-exit";
import { STD_EXTERNALS } from "./constants.js";
import { bold, green } from "./utils/colors.js";
import { parsePackageError } from "./utils/error.js";
import { logger } from "./utils/logger.js";
import { createMPK } from "./utils/mpk.js";
import { PackageJson } from "./utils/parsers/PackageJson.js";
import { ProjectConfig } from "./utils/project-config.js";

interface BuildCommandOptions {
    watch?: boolean;
    minify?: boolean;
}

export async function build(root: string | undefined, options: BuildCommandOptions): Promise<void> {
    try {
        await runBuild(root, options);
    } catch (error) {
        logger.error(error);
        process.exit(1);
    }
}

export async function runBuild(root: string | undefined, options: BuildCommandOptions = {}): Promise<void> {
    options.watch ??= false;
    options.minify ??= !!env.CI;
    root = path.resolve(root ?? "");

    process.chdir(root);

    const [pkg, isTsProject] = await Promise.all([readPackageJson(root), isTypeScriptProject(root)]);

    const project = new ProjectConfig({
        pkg,
        isTsProject
    });

    const bundles = await loadConfig(project);

    // await fs.rm(project.outputDirs.dist, { recursive: true, force: true });

    console.dir(project.inputFiles);
    console.dir(project.outputDirs);
    console.dir(project.outputFiles);

    if (!options.watch) {
        buildMeasure.start();
        for (const bundle of bundles) {
            await buildBundle(bundle);
            logger.success(pprintSuccessOutput(bundle.output?.file!));
        }
        await createMPK(project.outputDirs.contentRoot, project.outputFiles.mpk);
        logger.success(pprintSuccessOutput(project.outputFiles.mpk));
        buildMeasure.end();
    } else {
        logger.start("Start build in watch mode");
        const watcher = watch(bundles);
        watcher.on("event", event => {
            if (event.code === "BUNDLE_END") {
                let [outFile] = event.output;
                outFile = bold(path.relative(root, outFile));
                logger.success(pprintSuccessOutput(outFile, event.duration));
                event.result?.close();
            }

            if (event.code === "ERROR") {
                logger.error(event.error);
            }

            if (event.code === "END") {
                logger.log("");
            }
        });

        onExit(() => {
            watcher.close();
            logger.log("");
            logger.log("Build watcher stopped");
        });
    }
}

async function defaultConfig(project: ProjectConfig): Promise<BuildOptions[]> {
    const esmBundle = {
        input: project.inputFiles.widgetFile,
        external: [...STD_EXTERNALS],
        output: {
            file: project.outputFiles.esm,
            format: "esm"
        }
    } satisfies BuildOptions;

    const umdBundle = {
        input: project.inputFiles.widgetFile,
        external: [...STD_EXTERNALS],
        output: {
            file: project.outputFiles.umd,
            format: "umd",
            name: `${project.pkg.packagePath}.${project.pkg.widgetName}`,
            globals: {
                "react/jsx-runtime": "react_jsx_runtime"
            }
        }
    } satisfies BuildOptions;

    const editorConfigBundle = {
        input: project.inputFiles.editorConfig,
        output: {
            file: project.outputFiles.editorConfig,
            format: "commonjs"
        }
    } satisfies BuildOptions;

    const editorPreviewBundle = {
        input: project.inputFiles.editorPreview,
        output: {
            file: project.outputFiles.editorPreview,
            format: "commonjs"
        }
    } satisfies BuildOptions;

    const bundles: BuildOptions[] = [esmBundle, umdBundle];

    const [addEditorConfig, addEditorPreview] = await Promise.all([
        hasEditorConfig(project),
        hasEditorPreview(project)
    ]);

    if (addEditorConfig) {
        bundles.push(editorConfigBundle);
    }

    if (addEditorPreview) {
        bundles.push(editorPreviewBundle);
    }

    return bundles;
}

async function loadConfig(project: ProjectConfig): Promise<BuildOptions[]> {
    return defaultConfig(project);
}

async function isTypeScriptProject(root: string): Promise<boolean> {
    return fs.access(path.resolve(root, "tsconfig.json"), fs.constants.F_OK).then(
        () => true,
        () => false
    );
}

async function hasEditorConfig(project: ProjectConfig): Promise<boolean> {
    return fs.access(path.resolve(project.inputFiles.editorConfig), fs.constants.F_OK).then(
        () => true,
        () => false
    );
}

async function hasEditorPreview(project: ProjectConfig): Promise<boolean> {
    return fs.access(path.resolve(project.inputFiles.editorPreview), fs.constants.F_OK).then(
        () => true,
        () => false
    );
}

async function readPackageJson(root: string): Promise<PackageJson> {
    const filePath = path.resolve(root, "package.json");
    try {
        return PackageJson.parse(JSON.parse(await fs.readFile(filePath, "utf-8")));
    } catch (error) {
        throw parsePackageError(error);
    }
}

function pprintSuccessOutput(file: string, duration?: number): string {
    if (!duration) {
        return `Built ${bold(file)}`;
    }
    return `Built ${bold(file)} in ${green(ms(duration))}`;
}

const buildMeasure = {
    start() {
        performance.mark("build-start");
    },
    end() {
        performance.mark("build-end");
        const buildInfo = performance.measure("build", "build-start", "build-end");
        logger.success("Done in", green(ms(buildInfo.duration)));
    }
};
