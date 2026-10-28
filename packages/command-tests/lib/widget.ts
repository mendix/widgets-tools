
export interface WidgetPackageJson {
    version: string;
    packagePath: string;
    widgetName: string;
    devDependencies: Record<string, string>
}

export type WidgetConfig = [
    platform: "web" | "native",
    boilerplate: "full" | "empty",
    language: "ts" | "js"
];

export function getWidgetName(...[platform, boilerplate, lang]: WidgetConfig): string {
    return `[${lang}_${platform}_${boilerplate}]`;
}
