import consola from "consola";
import fs from "node:fs/promises";
import path from "node:path";
import { env } from "node:process";
import ms from "pretty-ms";
import { BuildOptions, build as buildBundle, watch } from "rolldown";
import { onExit } from "signal-exit";
import { PackageJson } from "./lib/parsers/PackageJson.js";
import { bold, green } from "./utils/colors.js";
import { parsePackageError } from "./utils/error.js";

interface BuildCommandOptions {
    watch?: boolean;
    minify?: boolean;
}

export async function build(root: string | undefined, options: BuildCommandOptions): Promise<void> {
    try {
        // consola.log(root, options);
        await runBuild(root, options);
    } catch (error) {
        consola.error(error);
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
            consola.success(pprintSuccessOutput(bundle.output?.file!));
        }
        buildMeasure.end();
    } else {
        consola.start("Start build in watch mode");
        const watcher = watch(bundles);
        watcher.on("event", event => {
            if (event.code === "BUNDLE_END") {
                let [outFile] = event.output;
                outFile = bold(path.relative(root, outFile));
                consola.success(pprintSuccessOutput(outFile, event.duration));
                event.result?.close();
            }

            if (event.code === "END") {
                consola.log("");
            }
        });

        onExit(() => {
            watcher.close();
            consola.log("");
            consola.log("Build watcher stopped");
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
            ext: `editorConfig.${ext}`
        });

        const editorPreview = path.format({
            dir: "src",
            name: pkg.widgetName,
            ext: `editorPreview.${extJsx}`
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
        // const widgetDir = path.join(this.#dist, ...pkg.packagePath.split("."), pkg.widgetName.toLowerCase());
        const widgetDir = this.#dist;

        return { dist: this.#dist, widgetDir };
    }
}

function defaultConfig(project: ProjectConfig): BuildOptions[] {
    const esmBundle = {
        input: project.files.widgetFile,
        external: ["react/jsx-runtime"],
        output: {
            file: path.join(project.outputDirs.widgetDir, "widget.mjs"),
            format: "esm"
        }
    } satisfies BuildOptions;

    const umdBundle = {
        input: project.files.widgetFile,
        external: ["react/jsx-runtime"],
        output: {
            file: path.join(project.outputDirs.widgetDir, "widget.js"),
            format: "umd",
            name: `${project.pkg.packagePath}.${project.pkg.widgetName}`,
            globals: {
                "react/jsx-runtime": "react_jsx_runtime"
            }
        }
    } satisfies BuildOptions;

    return [esmBundle, umdBundle];
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
        consola.success("Done in", green(ms(buildInfo.duration)));
    }
};
