
export interface WidgetPackageJson {
    version: string;
    packagePath: string;
    widgetName: string;
    devDependencies: Record<string, string>
}

export type WidgetConfig = [
    platform: "web" | "native",
    boilerplate: "full" | "empty",
    language: "ts" | "js",
    version: "latest"
];

export function getWidgetName(...[platform, boilerplate, lang, version]: WidgetConfig): string {
    return `[${version.replace(".", "_")}_${lang}_${platform}_${boilerplate}]`;
}
