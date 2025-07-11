import { findUp } from "find-up-simple"
import { readFile } from "node:fs/promises"

export async function build() {
    const result = await readPackageUp()
    if (!result) {
        console.error("No package.json found")
        process.exit(1)
    }
    console.dir(result)
}

export async function readPackageUp(): Promise<{} | undefined> {
    const filePath = await findUp("package.json");
    if (!filePath) {
        return;
    }
    const data = await readFile(filePath, "utf-8");

    try {
        return JSON.parse(data);
    } catch {}
}