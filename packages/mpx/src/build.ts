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

    const [pkg, isTs] = await Promise.all([readPackageJson(root), isTypeScriptProject(root)]);

    const inputFiles = getInputFiles(pkg.widgetName, isTs);

    // const [entry] = await fg(["src/**/*.ts", "src/**/*.tsx"]);
    const bundle = await rolldown({
        input: inputFiles.widgetFile,
        external: [/^react\/jsx-runtime$/]
    });

    await bundle.write({
        format: "esm",
        minify: false
    });
}

interface InputFiles {
    editorConfig: string;
    editorPreview: string;
    packageXml: string;
    widgetFile: string;
    widgetXml: string;
}

function getInputFiles(widgetName: string, isTs: boolean): InputFiles {
    const ext = isTs ? "ts" : "js";
    const extJsx = isTs ? "tsx" : "jsx";

    const editorConfig = path.format({
        dir: "src",
        name: widgetName,
        ext: `editorConfig.${ext}`
    });

    const editorPreview = path.format({
        dir: "src",
        name: widgetName,
        ext: `editorPreview.${extJsx}`
    });

    const packageXml = path.format({
        dir: "src",
        base: "package.xml"
    });

    const widgetFile = path.format({
        dir: "src",
        name: widgetName,
        ext: extJsx
    });

    const widgetXml = path.format({
        dir: "src",
        name: widgetName,
        ext: "xml"
    });

    return { editorConfig, editorPreview, packageXml, widgetFile, widgetXml };
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
