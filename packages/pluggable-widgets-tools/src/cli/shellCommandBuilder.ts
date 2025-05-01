import { existsSync } from "node:fs";
import { join } from "node:path";

export interface ShellCommandBuilder {
    arg(...arg: Array<TextElement>): ShellCommandBuilder;
    option(option: string, value: TextElement): ShellCommandBuilder;
    flag(flag: string): ShellCommandBuilder;
    unFlag(flag: string): ShellCommandBuilder;
    /**
     * Builds the final string used to execute the command.
     * @param toolsRoot Full path to the widgets-tools package
     * @param widgetRoot Full path to the widget being built
     */
    build(context: ShellCommandContext): string;
}

export type ShellCommandContext = {
    toolsRoot: string;
    widgetRoot: string;
};

type TextElement = string | ((context: ShellCommandContext) => string);

function textElementToString(value: TextElement, context: ShellCommandContext) {
    if (typeof value === "function") return value(context);

    return value;
}

const prefix = "--";

const optionPairToString = ([key, value]: [string, TextElement], context: ShellCommandContext) => {
    return key + " " + textElementToString(value, context).trim();
};

function makeFlag(name: string): string {
    name = name.trim();
    if (name.length > 1) return prefix + name;
    return "-" + name;
}

export function shellCommandBuilder(...command: Array<TextElement | [string, TextElement]>): ShellCommandBuilder {
    return {
        arg: function(...args) {
            return shellCommandBuilder(...command, ...args);
        },
        flag: function(flag) {
            const element = makeFlag(flag);

            if (command.includes(element)) return shellCommandBuilder(...command);

            return shellCommandBuilder(...command, element);
        },
        unFlag: function(flag) {
            const flagIndex = command.indexOf(makeFlag(flag));

            if (flagIndex < 0) return shellCommandBuilder(...command);

            const head = command.slice(0, flagIndex);
            const tail = command.slice(flagIndex + 1);
            return shellCommandBuilder(...head, ...tail);
        },
        option: function(option, value) {
            const key = prefix + option.trim();
            const existingIndex = command.findIndex(e => typeof e === "object" && e[0] === key);

            if (existingIndex < 0) return shellCommandBuilder(...command, [key, value]);

            const head = command.slice(0, existingIndex);
            const tail = command.slice(existingIndex + 1);
            return shellCommandBuilder(...head, [key, value], ...tail);
        },
        build: function(context) {
            return command
                .map(element =>
                    typeof element === "object"
                        ? optionPairToString(element, context)
                        : textElementToString(element, context)
                )
                .map(element => element.trim())
                .filter(element => element.length > 0)
                .join(" ")
                .trim();
        }
    };
}

export function shell(staticParts: TemplateStringsArray, ...dynamicParts: TextElement[]) {
    return (context: ShellCommandContext) => {
        const contextualizedParts = dynamicParts.map(part => textElementToString(part, context))
        const combined = staticParts.flatMap((part, i) => typeof contextualizedParts[i] === "string" ? [part, contextualizedParts[i]] : [part]);
        return combined.join("");
    }
}

const rollupWithConfig = (config: string) =>
    shellCommandBuilder("rollup").option("config", ({ toolsRoot }) => join(toolsRoot, config));

rollupWithConfig("configs/rollup.config.mjs").flag("watch").flag("configProduction");

const rollupWithConfigSh = (config: string) => shell`rollup --config ${({ toolsRoot }) => join(toolsRoot, config)}`

shell`${rollupWithConfigSh("configs/rollup.config.mjs")} --watch`

const prettier = shellCommandBuilder("prettier").option("config", ({ toolsRoot, widgetRoot }) => {
    const widgetPrettier = join(widgetRoot, "prettier.config.js");
    return existsSync(widgetPrettier) ? widgetPrettier : join(toolsRoot, "configs/prettier.base.json");
});

prettier.flag("write").flag("check");

const eslint = shellCommandBuilder("eslint")
    .option("config", ({ widgetRoot }) => join(widgetRoot, ".eslintrc.js"))
    .option("ext", () => ".jsx,.js,.ts,.tsx src");

eslint.flag("fix");

const jestWithProject = (projects: string) =>
    shellCommandBuilder("jest").option("projects", ({ toolsRoot }) => join(toolsRoot, projects));

jestWithProject("test-config/jest.config.js");
