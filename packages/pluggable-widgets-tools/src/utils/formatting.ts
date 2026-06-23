import { existsSync } from "fs";
import { join } from "path";
import { format, Options } from "prettier";
import { toolsRoot, widgetRoot } from "../widget/paths";

const baseConfigPath = join(toolsRoot, "./configs/prettier.base.json");
const widgetConfigPath = join(widgetRoot, "./prettier.config.js");
export const prettierConfigPath = existsSync(widgetConfigPath) ? widgetConfigPath : baseConfigPath;

let prettierTypescriptConfig: Options | undefined;

/**
 * Uses prettier to format the given TypeScript sourcecode.
 * @param source The TypeScript snippet that needs to be formatted
 */
export async function formatTypeScript(source: string): Promise<string> {
    if (prettierTypescriptConfig === undefined) {
        const prettierConfig = await import(prettierConfigPath);
        prettierTypescriptConfig = {
            ...prettierConfig,
            parser: "babel-ts"
        };
    }

    return await format(source, prettierTypescriptConfig);
}
