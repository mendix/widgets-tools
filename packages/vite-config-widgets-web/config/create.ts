import type { ConfigEnv, UserConfig } from "vite";
import type { WidgetViteConfigOptions } from "../types";
import { buildEditorArtifacts } from "../build/editor-artifacts";
import { createMPK, deployMPKToMxProject } from "../build/mpk";
import { getResolveAlias, isBuildDev, resolveConfig } from "./resolve";
import { promises as fs } from "fs";
import { join, extname } from "path";
import { readdirSync, statSync } from "fs";

export function createConfig(options: WidgetViteConfigOptions, env: ConfigEnv): UserConfig {
    const { mode } = env;

    const isDev = isBuildDev(mode);
    const resolvedConfig = resolveConfig(options, isDev);
    const alias = getResolveAlias();
    const minifyMode = isDev ? false : "esbuild";
    const sourcemapMode = isDev ? "inline" : false;

    return {
        define: resolvedConfig.define,
        resolve: {
            alias
        },
        build: {
            target: "es2019",
            minify: minifyMode,
            sourcemap: sourcemapMode,
            lib: {
                entry: resolvedConfig.runtimeEntry,
                name: resolvedConfig.widgetName
            },
            outDir: resolvedConfig.runtimeOutDir,
            rollupOptions: {
                output: resolvedConfig.runtimeOutputs.map(runtimeOutput => ({
                    format: runtimeOutput.format,
                    entryFileNames: runtimeOutput.entryFileName,
                    inlineDynamicImports: true
                })),
                external: resolvedConfig.runtimeExternals
            }
        },
        plugins: [
            {
                name: "vite-plugin-widget-typings",
                apply: "build",
                async buildStart() {
                    const packageXmlPath = join(resolvedConfig.sourceDir, "package.xml");
                    try {
                        const { transformPackage } = await import("../dist/widget-typings-generator.js");
                        const packageXmlContent = await fs.readFile(packageXmlPath, "utf8");
                        await transformPackage(packageXmlContent, resolvedConfig.sourceDir);
                    } catch (error) {
                        // Skip if package.xml doesn't exist (not a widget project)
                        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
                            console.warn("Widget typings generation failed:", error);
                        }
                    }
                }
            },
            {
                name: "vite-plugin-mpk-builder",
                apply: "build",
                enforce: "post",
                async closeBundle() {
                    if (resolvedConfig.editorBuilds.length > 0) {
                        console.log("Building editor artifacts...");
                        await buildEditorArtifacts(resolvedConfig.editorBuilds, isDev);
                    }

                    console.log("Building MPK...");
                    const mpkPath = await createMPK(resolvedConfig);
                    await deployMPKToMxProject(mpkPath);
                }
            }
        ]
    };
}
