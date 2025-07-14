import fs from "node:fs/promises";
import path from "node:path";
import { env } from "node:process";
import ms from "pretty-ms";
import { BuildOptions, build as buildBundle, watch } from "rolldown";
import { onExit } from "signal-exit";
import { STD_EXTERNALS } from "./constants.js";
import { PackageJson } from "./lib/parsers/PackageJson.js";
import { bold, green } from "./utils/colors.js";
import { parsePackageError } from "./utils/error.js";
import { logger } from "./utils/logger.js";

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

    await fs.rm(project.outputDirs.dist, { recursive: true, force: true });

    if (!options.watch) {
        buildMeasure.start();
        for (const bundle of bundles) {
            await buildBundle(bundle);
            logger.success(pprintSuccessOutput(bundle.output?.file!));
        }
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

interface BundleInputFiles {
    editorConfig: string;
    editorPreview: string;
    packageXml: string;
    widgetFile: string;
    widgetXml: string;
}

interface BundleOutputFiles {
    editorConfig: string;
    editorPreview: string;
    esm: string;
    umd: string;
}

interface BundleOutputDirs {
    dist: string;
    widgetDir: string;
}

interface ProjectConfigInputs {
    pkg: PackageJson;
    isTsProject: boolean;
}

class ProjectConfig {
    readonly #dist = path.join("dist");
    readonly #inputs: ProjectConfigInputs;
    readonly pkg: PackageJson;
    readonly isTsProject: boolean;
    readonly configExt = "editorConfig";
    readonly previewExt = "editorPreview";

    constructor(inputs: ProjectConfigInputs) {
        this.#inputs = inputs;
        this.pkg = inputs.pkg;
        this.isTsProject = inputs.isTsProject;
    }

    get files(): BundleInputFiles {
        const { pkg, isTsProject } = this.#inputs;
        const ext = isTsProject ? "ts" : "js";
        const extJsx = isTsProject ? "tsx" : "jsx";

        const editorConfig = path.format({
            dir: "src",
            name: pkg.widgetName,
            ext: `${this.configExt}.${ext}`
        });

        const editorPreview = path.format({
            dir: "src",
            name: pkg.widgetName,
            ext: `${this.previewExt}.${extJsx}`
        });

        const packageXml = path.format({
            dir: "src",
            base: "package.xml"
        });

        const widgetFile = path.format({
            dir: "src",
            name: pkg.widgetName,
            ext: extJsx
        });

        const widgetXml = path.format({
            dir: "src",
            name: pkg.widgetName,
            ext: "xml"
        });

        return { editorConfig, editorPreview, packageXml, widgetFile, widgetXml };
    }

    get outputDirs(): BundleOutputDirs {
        const { pkg } = this.#inputs;
        const widgetDir = path.join(this.#dist, ...pkg.packagePath.split("."), pkg.widgetName.toLowerCase());

        return { dist: this.#dist, widgetDir };
    }

    get outputFiles(): BundleOutputFiles {
        return {
            esm: path.format({
                dir: this.outputDirs.widgetDir,
                name: this.pkg.widgetName,
                ext: "mjs"
            }),
            umd: path.format({
                dir: this.outputDirs.widgetDir,
                name: this.pkg.widgetName,
                ext: "js"
            }),
            editorConfig: path.format({
                dir: this.outputDirs.dist,
                name: this.pkg.widgetName,
                ext: `${this.configExt}.js`
            }),
            editorPreview: path.format({
                dir: this.outputDirs.dist,
                name: this.pkg.widgetName,
                ext: `${this.previewExt}.js`
            })
        };
    }
}

async function defaultConfig(project: ProjectConfig): Promise<BuildOptions[]> {
    const esmBundle = {
        input: project.files.widgetFile,
        external: [...STD_EXTERNALS],
        output: {
            file: project.outputFiles.esm,
            format: "esm"
        }
    } satisfies BuildOptions;

    const umdBundle = {
        input: project.files.widgetFile,
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
        input: project.files.editorConfig,
        output: {
            file: project.outputFiles.editorConfig,
            format: "commonjs"
        }
    } satisfies BuildOptions;

    const editorPreviewBundle = {
        input: project.files.editorPreview,
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
    return fs.access(path.resolve(project.files.editorConfig), fs.constants.F_OK).then(
        () => true,
        () => false
    );
}

async function hasEditorPreview(project: ProjectConfig): Promise<boolean> {
    return fs.access(path.resolve(project.files.editorPreview), fs.constants.F_OK).then(
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
