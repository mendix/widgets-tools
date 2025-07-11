import { type } from "arktype";
import { findUp } from "find-up-simple";
import { readFile } from "node:fs/promises";
import { PackageJson } from "./lib/core/PackageJson.js";

export async function build() {
    console.log("Building the project...");
    const result = await readPackageUp();
    if (!result) {
        throw new Error("No package.json found");
    }
    const pkg = PackageJson(result);

    if (pkg instanceof type.errors) {
        console.error(pkg.summary);
        throw new Error("package.json is invalid");
    }
    console.dir(pkg);
}

export async function readPackageUp(): Promise<{} | undefined> {
    const filePath = await findUp("package.json");
    console.log("Found package.json at:", filePath);
    if (!filePath) {
        return;
    }
    const data = await readFile(filePath, "utf-8");

    try {
        return JSON.parse(data);
    } catch {
        console.error("Failed to parse package.json");
    }
}
