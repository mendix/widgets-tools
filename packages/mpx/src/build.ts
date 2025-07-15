import { ConsolaInstance } from "consola";
import fg from "fast-glob";
import fs from "node:fs/promises";
import path from "node:path";
import { env } from "node:process";
import ms from "pretty-ms";
import { BuildOptions, build as buildBundle, watch } from "rolldown";
import { onExit } from "signal-exit";
import { STD_EXTERNALS } from "./constants.js";
import { bold, green } from "./utils/colors.js";
import { hasEditorConfig, hasEditorPreview, isTypeScriptProject, readPackageJson } from "./utils/fs.js";
import { createLogger } from "./utils/logger.js";
import { createMPK } from "./utils/mpk.js";
import { ProjectConfig } from "./utils/project-config.js";

interface BuildCommandOptions {
    watch?: boolean;
    minify?: boolean;
}

// TODO: Copy files and add watcher.

export async function build(root: string | undefined, options: BuildCommandOptions): Promise<void> {
    options.watch ??= false;
    options.minify ??= !!env.CI;

    const logger: ConsolaInstance = createLogger();
    try {
        root = path.resolve(root ?? "");
        process.chdir(root);

        const [pkg, isTsProject] = await Promise.all([readPackageJson(root), isTypeScriptProject(root)]);

        const project = new ProjectConfig({
            pkg,
            isTsProject
        });

        const bundles = await loadConfig(project);

        await fs.rm(project.outputDirs.dist, { recursive: true, force: true });
        console.dir(project.inputFiles);
        console.dir(project.outputDirs);
        console.dir(project.outputFiles);
        if (options.watch) {
            await tasks.watch({ project, bundles, logger, root });
        } else {
            await tasks.build({ project, bundles, logger, root });
        }
    } catch (error) {
        logger.error(error);
        process.exit(1);
    }
}

interface TaskInput {
    root: string;
    bundles: BuildOptions[];
    project: ProjectConfig;
    logger: ConsolaInstance;
}

const tasks = {
    async build({ project, bundles, logger }: TaskInput): Promise<void> {
        buildMeasure.start();

        for (const bundle of bundles) {
            await buildBundle(bundle);
            logger.success(formatMsg.built(bundle.output?.file!));
        }

        const stream = fg.stream(["src/*.xml", "src/*.@(tile|icon)?(.dark).png"]);
        for await (const src of stream) {
            const f = path.parse(src as string);
            const dst = path.join(project.outputDirs.contentRoot, f.base);
            await fs.cp(src as string, dst, {
                recursive: true
            });
        }

        await createMPK(project.outputDirs.contentRoot, project.outputFiles.mpk);
        logger.success(formatMsg.built(project.outputFiles.mpk));

        const buildInfo = buildMeasure.end();
        logger.success("Done in", green(ms(buildInfo.duration)));
    },
    async watch({ root, bundles, logger }: TaskInput): Promise<void> {
        logger.start("Start build in watch mode");

        const bundlesWatcher = watch(bundles);

        let waitingChanges = false;
        bundlesWatcher.on("event", event => {
            if (event.code === "BUNDLE_END") {
                let [outFile] = event.output;
                outFile = bold(path.relative(root, outFile));
                if (!waitingChanges) {
                    logger.success(formatMsg.built(outFile));
                } else {
                    logger.success(formatMsg.rebuilt(outFile, event.duration));
                }
                event.result?.close();
            }

            if (event.code === "ERROR") {
                logger.error(event.error);
            }

            if (event.code === "END") {
                logger.log("");
                if (!waitingChanges) {
                    logger.info("Watching for changes...");
                }
                waitingChanges = true;
            }
        });

        onExit(() => {
            bundlesWatcher.close();
            logger.log("");
            logger.log("Build watcher stopped");
        });
    }
};

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

const formatMsg = {
    built: (file: string) => `Built ${bold(file)}`,
    rebuilt: (file: string, duration: number) => `Rebuilt ${bold(file)} in ${green(ms(duration))}`
};

const buildMeasure = {
    start() {
        performance.mark("build-start");
    },
    end() {
        performance.mark("build-end");
        return performance.measure("build", "build-start", "build-end");
    }
};
