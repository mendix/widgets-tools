import fs from "node:fs/promises";
import path from "node:path";
import { zip } from "zip-a-folder";

export async function createMPK(contentRoot: string, filename: string): Promise<void> {
    const dst = path.dirname(filename);
    await fs.mkdir(dst, { recursive: true });
    await zip(contentRoot, filename);
}
