import { BuildOptions, RolldownPlugin } from "rolldown";
import { STD_EXTERNALS } from "./constants.js";
import { plugins, RollupUrlOptions } from "./plugins.js";
import { hasEditorConfig, hasEditorPreview } from "./utils/fs.js";
import { ProjectConfig } from "./utils/project-config.js";

export async function defaultConfig(project: ProjectConfig): Promise<BuildOptions[]> {
    const esmBundle = {
        input: project.inputFiles.widgetFile,
        external: [...STD_EXTERNALS],
        plugins: stdPlugins(project),
        output: {
            file: project.outputFiles.esm,
            format: "esm"
        }
    } satisfies BuildOptions;

    const umdBundle = {
        input: project.inputFiles.widgetFile,
        external: [...STD_EXTERNALS],
        plugins: stdPlugins(project),
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

export async function loadConfig(project: ProjectConfig): Promise<BuildOptions[]> {
    return defaultConfig(project);
}

function stdPlugins(project: ProjectConfig): RolldownPlugin[] {
    const { url, image } = plugins;

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

    return [url(urlOptions), image()];
}
