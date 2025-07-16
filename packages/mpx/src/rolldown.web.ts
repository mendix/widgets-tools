import { ConsolaInstance } from "consola";
import { BuildOptions, RolldownPlugin } from "rolldown";
import { STD_EXTERNALS } from "./constants.js";
import { plugins, RollupLicenseOptions, RollupUrlOptions } from "./plugins.js";
import { hasEditorConfig, hasEditorPreview, loadCustomConfigFactory } from "./utils/fs.js";
import { licenseCustomTemplate } from "./utils/helpers.js";
import { ProjectConfigWeb } from "./utils/project-config.js";

export async function defaultConfig(config: ProjectConfigWeb): Promise<BuildOptions[]> {
    const jsx: BuildOptions["jsx"] = {
        mode: "classic",
        factory: "createElement",
        fragment: "Fragment",
        importSource: "react"
    };

    const esmBundle = {
        input: config.inputFiles.widgetFile,
        external: [...STD_EXTERNALS],
        plugins: [...stdPlugins(config)],
        jsx,
        output: {
            file: config.outputFiles.esm,
            format: "esm"
        }
    } satisfies BuildOptions;

    const umdBundle = {
        input: config.inputFiles.widgetFile,
        external: [...STD_EXTERNALS],
        plugins: [...stdPlugins(config)],
        jsx,
        output: {
            file: config.outputFiles.umd,
            format: "umd",
            name: `${config.pkg.packagePath}.${config.pkg.widgetName}`,
            globals: {
                "react/jsx-runtime": "react_jsx_runtime",
                react: "React"
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
            jsx,
            output: {
                file: config.outputFiles.editorPreview,
                format: "commonjs"
            }
        } satisfies BuildOptions;

        bundles.push(editorPreviewBundle);
    }

    return bundles;
}

export async function loadConfig(config: ProjectConfigWeb, logger: ConsolaInstance): Promise<BuildOptions[]> {
    const [configFactory, configDefaultConfig] = await Promise.all([
        loadCustomConfigFactory(logger),
        defaultConfig(config)
    ]);
    if (configFactory) {
        return configFactory({ configDefaultConfig });
    }
    return configDefaultConfig;
}

function stdPlugins(config: ProjectConfigWeb): RolldownPlugin[] {
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
        publicPath: config.assetsPublicPath,
        destDir: config.outputDirs.widgetAssetsDir
    };

    const licenseOptions: RollupLicenseOptions = {
        thirdParty: {
            includePrivate: true,
            output: [
                {
                    file: config.outputFiles.dependenciesTxt
                },
                {
                    file: config.outputFiles.dependenciesJson,
                    template: licenseCustomTemplate
                }
            ]
        }
    };

    return [url(urlOptions), image(), license(licenseOptions)];
}
