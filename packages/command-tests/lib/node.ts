import { fileURLToPath } from "node:url";

/**
 * Resolves the given module and returns the full path.
 * This corresponds to the "main" or "import" property of a package.json.
 *
 * @example
 * ```js
 * resolve("@mendix/generator-widget") // "/path/to/generator-widget/generators/app/index.js"
 * ```
 */
export function resolveModule(packageName: string): string {
    return fileURLToPath(import.meta.resolve(packageName));
}
