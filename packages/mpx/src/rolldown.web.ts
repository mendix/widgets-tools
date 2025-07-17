import { ConsolaInstance } from "consola";
import path from "node:path";
import postcssImport from "postcss-import";
import postcssUrl from "postcss-url";
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

    const define = {
        "process.env.NODE_ENV": "'production'"
    } as const;

    const esmBundle = {
        input: config.inputFiles.widgetFile,
        external: [...STD_EXTERNALS],
        plugins: [...stdPlugins(config), widgetPostcssPlugin(config)],
        jsx,
        define,
        output: {
            file: config.outputFiles.esm,
            format: "esm"
        }
    } satisfies BuildOptions;

    const umdBundle = {
        input: config.inputFiles.widgetFile,
        external: [...STD_EXTERNALS],
        plugins: [...stdPlugins(config), widgetPostcssPlugin(config)],
        jsx,
        define,
        output: {
            file: config.outputFiles.umd,
            format: "umd",
            name: `${config.pkg.packagePath}.${config.pkg.widgetName}`,
            globals: {
                "react/jsx-runtime": "react_jsx_runtime",
                react: "react",
                "react-dom": "react_dom",
                mendix: "mendix"
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
            plugins: [plugins.url({ include: ["**/*.svg"], limit: 143360 }), plugins.image()],
            define,
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
            define,
            plugins: [
                plugins.postcss({
                    extensions: [".css", ".sass", ".scss"],
                    extract: false,
                    inject: true,
                    minimize: config.minify,
                    plugins: [postcssImport(), postcssUrl({ url: "inline" })],
                    // Disable warnings until it's fixed in postcss plugin
                    // https://github.com/egoist/rollup-plugin-postcss/issues/463
                    use: {
                        sass: {
                            silenceDeprecations: ["legacy-js-api"]
                        }
                    } as any
                }),
                plugins.image()
            ],
            jsx,
            output: {
                file: config.outputFiles.editorPreview,
                format: "commonjs"
            }
        } satisfies BuildOptions;

        // bundles.length = 0;
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

export function widgetPostcssPlugin(config: ProjectConfigWeb) {
    /**
     * This function is used by postcss-url.
     * Its main purpose to "adjust" asset path so that
     * after bundling css by studio assets paths stay correct.
     * Adjustment is required because of assets copying -- postcss-url can copy
     * files, but final url will be relative to *destination* file and though
     * will be broken after bundling by studio (pro).
     *
     * Example
     * before: assets/icon.png
     * after: com/mendix/widget/web/accordion/assets/icon.png
     */
    const cssUrlTransform = (asset: { url: string }) =>
        asset.url.startsWith("assets/") ? `${config.publicPath}/${asset.url}` : asset.url;

    return plugins.postcss({
        extensions: [".css", ".sass", ".scss"],
        inject: false,
        extract: path.resolve(config.outputFiles.css),
        minimize: config.minify,
        plugins: [
            postcssImport(),
            /**
             * We need two copies of postcss-url because of final styles bundling in studio (pro).
             * On line below, we just copying assets to widget bundle directory (com.mendix.widgets...)
             * To make it work, this plugin have few requirements:
             * 1. You should put your assets in src/assets/
             * 2. You should use relative path in your .scss files (e.g. url(../assets/icon.png)
             * 3. This plugin relies on `to` property of postcss plugin and it should be present, when
             * copying files to destination.
             */
            postcssUrl({ url: "copy", assetsPath: "assets" }),
            /**
             * This instance of postcss-url is just for adjusting asset path.
             * Check doc comment for *createCssUrlTransform* for explanation.
             */
            postcssUrl({ url: cssUrlTransform })
        ],
        sourceMap: false,
        // Disable warnings until it's fixed in postcss plugin
        // https://github.com/egoist/rollup-plugin-postcss/issues/463
        use: {
            sass: {
                silenceDeprecations: ["legacy-js-api"]
            }
        } as any
    });
}
