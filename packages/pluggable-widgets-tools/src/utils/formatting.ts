import { readFile } from "fs/promises";
import { join } from "path";
import { resolveConfig, format, Options } from "prettier";
import { cwd } from "process";

const prettierConfigBasePath = join(__dirname, "../../configs/prettier.base.json");

let prettierTypescriptConfig: Options | undefined;

/**
 * Uses prettier to format the given TypeScript sourcecode.
 * @param source The TypeScript snippet that needs to be formatted
 */
export async function formatTypeScript(source: string): Promise<string> {
    if (prettierTypescriptConfig === undefined) {
        const fakeFilename = join(cwd(), "./src/widget.ts");
        // If the widget does not have a prettier config, fall back to packaged base config
        const prettierConfig =
            (await resolveConfig(fakeFilename)) ?? JSON.parse(await readFile(prettierConfigBasePath, "utf-8"));

        prettierTypescriptConfig = {
            ...prettierConfig,
            parser: "babel-ts"
        };
    }

    return await format(source, prettierTypescriptConfig);
}
