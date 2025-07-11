import { type } from "arktype";

export const PackageJson = type({
    name: "string",
    version: "string.semver",
    widgetName: "string.upper"
});

export type PackageJson = typeof PackageJson.infer;
