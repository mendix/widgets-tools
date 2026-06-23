import { existsSync, readFileSync } from "fs";
import { throwOnIllegalChars, throwOnNoMatch } from "../utils/validation";
import { join } from "path";
import { cwd } from "process";

/**
 * The full path to the root directory of the widget package
 */
export const dir = cwd();

/**
 * The full path to the widget's package.json file
 */
export const path = join(dir, "package.json");
if (!existsSync(path)) {
    throw new Error(`"Could not locate the widget's package.json at "${path}"`);
}

/**
 * The contents of the widget's package.json
 */
export const json = JSON.parse(readFileSync(path, "utf-8"));

/**
 * The name of the widget
 */
export const widgetName: string = json.widgetName;
if (!widgetName) {
    throw new Error("Widget does not define widgetName in its package.json");
}
throwOnIllegalChars(widgetName, "a-zA-Z", "The `widgetName` property in package.json");

/**
 * The organization name of the widget as defined by the `packagePath` package.json property.
 */
export const widgetOrganization: string = json.packagePath;
throwOnIllegalChars(widgetOrganization, "a-zA-Z0-9_.-", "The `packagePath` property in package.json");
throwOnNoMatch(widgetOrganization, /^([a-zA-Z0-9_-]+.)*[a-zA-Z0-9_-]+$/, "The `packagePath` property in package.json");

/**
 * The name of the widget package
 */
export const packageName: string = json.name;

/**
 * The version of the widget package.
 */
export const widgetVersion: string = json.version;

/**
 * The ID of the widget
 */
export const widgetId: string = [widgetOrganization, packageName, widgetName].join(".");
