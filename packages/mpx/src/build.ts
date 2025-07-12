import { ArkErrors } from "arktype";
import chalk from "chalk";
import fg from "fast-glob";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { rolldown } from "rolldown";
import { pprint } from "./error-utils.js";
import { PackageJson } from "./lib/core/PackageJson.js";

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
    root = resolve(root ?? "");
    process.chdir(root);

    const pkg = await readPackageJson(root);
    const [entry] = await fg(["src/**/*.ts", "src/**/*.tsx"]);
    const bundle = await rolldown({
        input: entry,
        external: [/^react\/jsx-runtime$/]
    });

    await bundle.write({
        format: "esm",
        minify: false
    });
}

export async function readPackageJson(root: string): Promise<PackageJson> {
    const filePath = resolve(root, "package.json");
    const pkg = PackageJson(await readFile(filePath, "utf-8"));

    if (pkg instanceof ArkErrors) {
        throw new Error(`Invalid package.json:\n${pkg.summary}`);
    }

    return pkg;
}
