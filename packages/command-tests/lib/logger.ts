import { format, styleText } from "node:util";
import { type Config, getWidgetName } from "./config.ts";

type Arguments<F> = F extends (...args: infer Args) => unknown ? Args : never;
type TextStyles = Arguments<typeof styleText>[0];

const COLORS: TextStyles[] = [
    "green",
    "yellow",
    "blue",
    "magenta",
    "cyan",
    "bgGreen",
    "bgYellow",
    "bgBlue",
    "bgMagenta",
    "bgCyan"
];

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export type Logger = (template: string, ...msgs: any[]) => void;

export function getWidgetLogger(index: number, ...[platform, boilerplate, lang, version]: Config): Logger {
    const colorName = COLORS[index % COLORS.length];
    return (template, ...msgs) =>
        console.log(
            "%s %s",
            styleText(colorName, getWidgetName(platform, boilerplate, lang, version)),
            format(template, ...msgs)
        );
}
