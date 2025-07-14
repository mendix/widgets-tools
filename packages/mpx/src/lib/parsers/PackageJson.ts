import { type } from "arktype";

export const PackageJson = type("string.json.parse").to({
    name: type("string > 0").to("string.trim"),
    version: "string.semver",
    widgetName: type("string > 0").to("string.trim"),
    packagePath: type(/^[a-zA-Z]+(\.[a-zA-Z]+)*$/).describe("must be dot separated path like 'example.widget'")
});

export type PackageJson = typeof PackageJson.infer;
