export type Config = [
    platform: "web" | "native",
    boilerplate: "full" | "empty",
    language: "ts" | "js",
    version: "latest"
];

export function getWidgetName(...[platform, boilerplate, lang, version]: Config): string {
    return `[${version.replace(".", "_")}_${lang}_${platform}_${boilerplate}]`;
}
