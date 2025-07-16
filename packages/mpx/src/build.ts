import chokidar from "chokidar";
import { ConsolaInstance } from "consola";
import dotenv from "dotenv";
import fg from "fast-glob";
import { filesize } from "filesize";
import fs from "node:fs/promises";
import path from "node:path";
import { env } from "node:process";
import ms from "pretty-ms";
import { BuildOptions, build as buildBundle, watch } from "rolldown";
import { onExit } from "signal-exit";
import { PACKAGE_FILES } from "./constants.js";
import { loadConfig } from "./rolldown.js";
import { blue, bold, dim, green, greenBright, inverse } from "./utils/colors.js";
import { deployToMxProject, isTypeScriptProject, readPackageJson } from "./utils/fs.js";
import { createLogger } from "./utils/logger.js";
import { createMPK } from "./utils/mpk.js";
import { ProjectConfig } from "./utils/project-config.js";

interface BuildCommandOptions {
    watch?: boolean;
    minify?: boolean;
}

/**
 * Build the widget project.
 * @param root - Widget directory containing package.json
 * @param options - Build options
 */
export async function build(root: string | undefined, options: BuildCommandOptions): Promise<void> {
    options.watch ??= false;
    options.minify ??= !!env.CI;

    const logger: ConsolaInstance = createLogger();
    try {
        root = path.resolve(root ?? "");
        process.chdir(root);
        dotenv.config({ quiet: true });

        const [pkg, isTsProject] = await Promise.all([readPackageJson(root), isTypeScriptProject(root)]);

        const config = await ProjectConfig.create({
            pkg,
            isTsProject
        });

        if (config.projectPath) {
            logger.info(formatMsg.mxpath(config.projectPath));
        }

        const bundles = await loadConfig(config, logger);

        await fs.rm(config.outputDirs.dist, { recursive: true, force: true });
        // console.dir(config.toPlainObject(), { depth: 3 });
        if (options.watch) {
            await tasks.watch({ config, bundles, logger, root });
        } else {
            await tasks.build({ config, bundles, logger, root });
        }
    } catch (error) {
        logger.error(error);
        process.exit(1);
    }
}

interface TaskParams {
    root: string;
    bundles: BuildOptions[];
    config: ProjectConfig;
    logger: ConsolaInstance;
}

const tasks = {
    async build(params: TaskParams): Promise<void> {
        const { config, bundles, logger } = params;
        buildMeasure.start();

        for (const bundle of bundles) {
            await buildBundle(bundle);
            logger.success(formatMsg.built(bundle.output?.file!));
        }

        await tasks.copyPackageFiles(params);
        await tasks.buildMpk(params);

        const buildInfo = buildMeasure.end();
        logger.success("Done in", green(ms(buildInfo.duration)));

        if (config.projectPath) {
            await deployToMxProject(config, config.projectPath);
        }
    },
    async watch(params: TaskParams): Promise<void> {
        const { root, bundles, logger } = params;
        logger.start("Start build in watch mode");

        const bundlesWatcher = watch(bundles);

        const bundleWatchReady = new Promise<void>(resolve => {
            let isFirstEvent = true;
            bundlesWatcher.on("event", event => {
                if (event.code === "BUNDLE_END") {
                    let [outFile] = event.output;
                    outFile = path.relative(root, outFile);
                    if (isFirstEvent) {
                        logger.success(formatMsg.built(outFile));
                    } else {
                        logger.info(formatMsg.rebuilt(outFile, event.duration));
                    }
                    event.result?.close();
                }

                if (event.code === "ERROR") {
                    logger.error(event.error);
                }

                if (event.code === "END") {
                    if (isFirstEvent) {
                        resolve();
                    }
                    isFirstEvent = false;
                }
            });
        });

        await bundleWatchReady;
        await tasks.watchPackageFiles(params);
        await tasks.watchPackageContent(params);
        logger.info("Waiting for changes...");

        onExit(() => {
            bundlesWatcher.close();
            logger.log("");
            logger.log("Build watcher stopped");
        });
    },
    async copyPackageFiles({ config }: TaskParams): Promise<void> {
        const stream = fg.stream(PACKAGE_FILES);
        for await (const src of stream) {
            const f = path.parse(src as string);
            const dst = path.join(config.outputDirs.contentRoot, f.base);

            await fs.cp(src as string, dst, {
                recursive: true
            });
        }
    },
    /** Watch & copy static package files */
    async watchPackageFiles(params: TaskParams): Promise<void> {
        const { config, logger } = params;

        await tasks.copyPackageFiles(params);

        const watcher = chokidar.watch(await fg(PACKAGE_FILES));
        watcher.on("change", async file => {
            logger.info(formatMsg.copy(file));
            const f = path.parse(file);
            const dst = path.join(config.outputDirs.contentRoot, f.base);
            await fs.cp(file, dst);
        });

        onExit(() => {
            watcher.close();
        });
    },
    /** Setup package content watcher to build mpk whenever package files change */
    async watchPackageContent(params: TaskParams): Promise<void> {
        const { config } = params;
        await tasks.buildMpk({ ...params, quiet: true });
        const watcher = chokidar.watch(config.outputDirs.contentRoot);

        let debounceTimer: NodeJS.Timeout | null = null;

        watcher.on("change", async () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }

            debounceTimer = setTimeout(() => tasks.buildMpk(params), 30);
        });

        onExit(() => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
            watcher.close();
        });
    },
    async buildMpk({ config, logger, quiet = false }: TaskParams & { quiet?: boolean }): Promise<void> {
        await createMPK(config.outputDirs.contentRoot, config.outputFiles.mpk);
        const mpkStat = await fs.stat(config.outputFiles.mpk);
        if (!quiet) {
            logger.success(formatMsg.builtSize(config.outputFiles.mpk, mpkStat.size));
        }
    }
};

const formatMsg = {
    built: (file: string) => `Built ${bold(file)}`,
    builtSize: (file: string, size: number) => `Built ${bold(file)} (${dim(filesize(size, { standard: "jedec" }))})`,
    rebuilt: (file: string, duration: number) => `Rebuilt ${dim(file)} in ${green(ms(duration))}`,
    copy: (file: string) => `Copy ${bold(file)}`,
    mxpath: (dir: string) => `${inverse(greenBright(bold("  MX PROJECT PATH  ")))}${blue(bold(` ${dir} `))}`
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
