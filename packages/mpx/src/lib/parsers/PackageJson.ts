import { type } from "arktype";

export const PackageJson = type("string.json.parse").to({
    name: type("string > 0").to("string.trim"),
    version: "string.semver",
    widgetName: type("string > 0").to("string.trim")
});

export type PackageJson = typeof PackageJson.infer;
