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
import { transformPackage } from "../../pluggable-widgets-tools/src/typings-generator/index.js";
import { PACKAGE_FILES, XML_FILES } from "./constants.js";
import * as bundlesWeb from "./rolldown.web.js";
import { blue, bold, dim, green, greenBright, inverse } from "./utils/colors.js";
import { deployToMxProject, isTypeScriptProject, readPackageJson } from "./utils/fs.js";
import { createLogger } from "./utils/logger.js";
import { createMPK } from "./utils/mpk.js";
import { CliBuildOptions } from "./utils/parsers/CliBuildOptions.js";
import { ProjectConfig, ProjectConfigWeb } from "./utils/project-config.js";

/**
 * Build the widget project.
 * @param root - Widget directory containing package.json
 * @param options - Build options
 */
export async function build(root: string | undefined, options: CliBuildOptions): Promise<void> {
    const logger: ConsolaInstance = createLogger();
    try {
        root = path.resolve(root ?? "");
        process.chdir(root);
        dotenv.config({ quiet: true });

        const [pkg, isTsProject] = await Promise.all([readPackageJson(root), isTypeScriptProject(root)]);

        let config: ProjectConfig;
        if (options.platform === "web") {
            config = await ProjectConfigWeb.create({ pkg, isTsProject, minify: options.minify });
        } else {
            throw new Error(`Build for native is not implemented yet`);
        }

        if (config.projectPath) {
            logger.info(formatMsg.mxpath(config.projectPath));
        }

        if (env.MPKOUTPUT) {
            logger.info(formatMsg.mpk(env.MPKOUTPUT));
        }

        if (options.showConfig) {
            console.dir(config.toPlainObject(), { depth: 3 });
            return;
        }

        let bundles: BuildOptions[];
        if (options.platform === "web") {
            bundles = await bundlesWeb.loadConfig(config as ProjectConfigWeb, logger);
        } else {
            throw new Error(`Build for native is not implemented yet`);
        }

        await Promise.all([
            fs.rm(config.outputDirs.tmpDir, { recursive: true, force: true }),
            fs.rm(config.outputDirs.mpkDir, { recursive: true, force: true })
        ]);

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
        if (config.isTsProject) {
            await tasks.generateTypings(params);
        }

        for (const bundle of bundles) {
            await buildBundle(bundle);
            logger.success(formatMsg.built(bundle.output?.file!));
        }

        await tasks.copyPackageFiles(params);
        await tasks.buildMpk(params);

        const buildInfo = buildMeasure.end();
        logger.success("Done in", green(ms(buildInfo.duration)));

        if (config.projectPath) {
            await deployToMxProject(config, config.projectPath, config.deploymentPath);
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
        if (params.config.isTsProject) {
            await tasks.watchTypings(params);
        }
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

            debounceTimer = setTimeout(() => tasks.buildMpk(params), 150);
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
    },
    async generateTypings({ config }: TaskParams): Promise<void> {
        const packageXml = await fs.readFile(config.inputFiles.packageXml, { encoding: "utf8" });
        const src = path.dirname(config.inputFiles.packageXml);
        await transformPackage(packageXml, src);
    },
    async watchTypings(params: TaskParams): Promise<void> {
        await tasks.generateTypings(params);

        const watcher = chokidar.watch(await fg(XML_FILES));

        watcher.on("change", async () => {
            await tasks.generateTypings(params);
            params.logger.info(formatMsg.rebuiltTypings());
        });

        onExit(() => {
            watcher.close();
        });
    }
};

const formatMsg = {
    built: (file: string) => `Built ${bold(file)}`,
    builtSize: (file: string, size: number) => `Built ${bold(file)} (${dim(filesize(size, { standard: "jedec" }))})`,
    rebuilt: (file: string, duration: number) => `Rebuilt ${dim(file)} in ${green(ms(duration))}`,
    rebuiltTypings: () => `Rebuilt typings`,
    copy: (file: string) => `Copy ${bold(file)}`,
    mxpath: (dir: string) => `${inverse(greenBright(bold("  MX PROJECT PATH  ")))}${blue(bold(` ${dir} `))}`,
    mpk: (name: string) => `${inverse(bold("  MPKOUTPUT  "))}${blue(bold(` ${name} `))}`
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
