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
    ["bold", "green"],
    ["bold", "yellow"],
    ["bold", "blue"],
    ["bold", "magenta"],
    ["bold", "cyan"]
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

/***
 * Template that applies the provided ansi-styles to the text.
 * See `node:util.styleText` for more information.
 * @example
 * styled`Hi, ${"cyan"}Joe${"reset"}! You have ${"bold"}3 ${["bold", "yellow"]}pending${"reset"} messages.`
 */
export function styled(strings: TemplateStringsArray, ...styles: TextStyles[]) {
    let result = "";
    let style: TextStyles = "reset";
    for (let i = 0; i < strings.length; i++) {
        result += styleText(style, strings[i]);
        const nextStyle = styles[i] ?? "reset";
        if (
            typeof nextStyle === "string" ||
            (typeof nextStyle === "object" && "every" in nextStyle && nextStyle.every(x => typeof x === "string"))
        ) {
            style = nextStyle;
        } else {
            throw Error(`Expected a TextStyle argument, but received "${nextStyle}"`);
        }
    }
    return result;
}
