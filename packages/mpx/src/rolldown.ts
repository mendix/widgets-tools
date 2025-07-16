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

export async function defaultConfig(project: ProjectConfig): Promise<BuildOptions[]> {
    const esmBundle = {
        input: project.inputFiles.widgetFile,
        external: [...STD_EXTERNALS],
        plugins: stdPlugins(project),
        platform: "browser",
        output: {
            file: project.outputFiles.esm,
            format: "esm"
        }
    } satisfies BuildOptions;

    const umdBundle = {
        input: project.inputFiles.widgetFile,
        external: [...STD_EXTERNALS],
        plugins: stdPlugins(project),
        platform: "browser",
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
