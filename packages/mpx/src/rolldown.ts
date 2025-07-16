import { ConsolaInstance } from "consola";
import fg from "fast-glob";
import assert from "node:assert";
import path from "node:path";
import { BuildOptions, RolldownPlugin } from "rolldown";
import { Dependency } from "rollup-plugin-license";
import { STD_EXTERNALS } from "./constants.js";
import { plugins, RollupLicenseOptions, RollupUrlOptions } from "./plugins.js";
import { bold, green } from "./utils/colors.js";
import { hasEditorConfig, hasEditorPreview } from "./utils/fs.js";
import { ProjectConfig } from "./utils/project-config.js";

export async function defaultConfig(config: ProjectConfig): Promise<BuildOptions[]> {
    const esmBundle = {
        input: config.inputFiles.widgetFile,
        external: [...STD_EXTERNALS],
        plugins: stdPlugins(config),
        platform: "browser",
        output: {
            file: config.outputFiles.esm,
            format: "esm"
        }
    } satisfies BuildOptions;

    const umdBundle = {
        input: config.inputFiles.widgetFile,
        external: [...STD_EXTERNALS],
        plugins: stdPlugins(config),
        platform: "browser",
        output: {
            file: config.outputFiles.umd,
            format: "umd",
            name: `${config.pkg.packagePath}.${config.pkg.widgetName}`,
            globals: {
                "react/jsx-runtime": "react_jsx_runtime"
            }
        }
    } satisfies BuildOptions;

    const bundles: BuildOptions[] = [esmBundle, umdBundle];

    const [addEditorConfig, addEditorPreview] = await Promise.all([hasEditorConfig(config), hasEditorPreview(config)]);

    if (addEditorConfig) {
        const editorConfigBundle = {
            input: config.inputFiles.editorConfig,
            external: [...STD_EXTERNALS],
            treeshake: { moduleSideEffects: false },
            output: {
                file: config.outputFiles.editorConfig,
                format: "commonjs"
            }
        } satisfies BuildOptions;

        bundles.push(editorConfigBundle);
    }

    if (addEditorPreview) {
        const editorPreviewBundle = {
            input: config.inputFiles.editorPreview,
            external: [...STD_EXTERNALS],
            platform: "browser",
            output: {
                file: config.outputFiles.editorPreview,
                format: "commonjs"
            }
        } satisfies BuildOptions;

        bundles.push(editorPreviewBundle);
    }

    return bundles;
}

export async function loadConfig(project: ProjectConfig, logger: ConsolaInstance): Promise<BuildOptions[]> {
    const [configFile] = await fg(["rollup.config.{js,mjs}"]);
    if (configFile) {
        logger.info(formatMsg.usingCustomConfig());
        const { default: customConfig } = await import(path.resolve(configFile));
        assert(
            typeof customConfig === "function",
            `Rollup config error: expected default export to be a function, got ${typeof customConfig}`
        );
        const configDefaultConfig = await defaultConfig(project);
        return customConfig({ configDefaultConfig });
    }
    return defaultConfig(project);
}

function stdPlugins(project: ProjectConfig): RolldownPlugin[] {
    const { url, image, license } = plugins;

    const urlOptions: RollupUrlOptions = {
        include: [
            "**/*.svg",
            "**/*.png",
            "**/*.jp(e)?g",
            "**/*.gif",
            "**/*.webp",
            "**/*.ttf",
            "**/*.woff(2)?",
            "**/*.eot"
        ],
        limit: 0,
        publicPath: project.assetsPublicPath,
        destDir: project.outputDirs.widgetAssetsDir
    };

    const licenseOptions: RollupLicenseOptions = {
        thirdParty: {
            includePrivate: true,
            output: [
                {
                    file: project.outputFiles.dependenciesTxt
                },
                {
                    file: project.outputFiles.dependenciesJson,
                    template: licenseCustomTemplate
                }
            ]
        }
    };

    return [url(urlOptions), image(), license(licenseOptions)];
}

export const licenseCustomTemplate = (dependencies: Dependency[]) =>
    JSON.stringify(
        dependencies.map(dependency => {
            const repoUrl =
                typeof dependency.repository === "string"
                    ? dependency.repository
                    : dependency.repository instanceof Object
                      ? dependency.repository.url
                      : undefined;

            return {
                [dependency.name!]: {
                    version: dependency.version,
                    url: dependency.homepage ?? repoUrl
                }
            };
        })
    );

const formatMsg = {
    usingCustomConfig: () => green(bold(`Loading custom rollup config...`))
};
