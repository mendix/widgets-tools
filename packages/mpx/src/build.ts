import { ArkErrors } from "arktype";
import chalk from "chalk";
import fs from "node:fs/promises";
import path from "node:path";
import { rolldown } from "rolldown";
import { pprint } from "./error-utils.js";
import { PackageJson } from "./lib/parsers/PackageJson.js";

export async function actionBuild(root?: string) {
    try {
        await build(root);
    } catch (error) {
        console.error(chalk.red("BUILD ERROR"));
        console.error(pprint(error instanceof Error ? error.message : String(error)));
        process.exit(1);
    }
}

export async function build(root?: string) {
    root = path.resolve(root ?? "");
    process.chdir(root);

    const [pkg, isTsProject] = await Promise.all([readPackageJson(root), isTypeScriptProject(root)]);

    const config = new ProjectConfig({
        pkg,
        isTsProject
    });

    console.log(config.files, config.outputDirs);
    // const [entry] = await fg(["src/**/*.ts", "src/**/*.tsx"]);
    const bundle = await rolldown({
        input: config.files.widgetFile,
        external: [/^react\/jsx-runtime$/]
    });

    await bundle.write({
        format: "esm",
        minify: false
    });
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
    readonly #dist = path.join("dist/tmp/widgets");
    readonly #inputs: ProjectConfigInputs;

    constructor(inputs: ProjectConfigInputs) {
        this.#inputs = inputs;
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
        const widgetDir = path.join(this.#dist, ...pkg.packagePath.split("."), pkg.widgetName.toLowerCase());

        return { dist: this.#dist, widgetDir };
    }
}

async function isTypeScriptProject(root: string): Promise<boolean> {
    return fs.access(path.resolve(root, "tsconfig.json"), fs.constants.F_OK).then(
        () => true,
        () => false
    );
}

async function readPackageJson(root: string): Promise<PackageJson> {
    const filePath = path.resolve(root, "package.json");
    const pkg = PackageJson(await fs.readFile(filePath, "utf-8"));

    if (pkg instanceof ArkErrors) {
        throw new Error(`Invalid package.json:\n${pkg.summary}`);
    }

    return pkg;
}
