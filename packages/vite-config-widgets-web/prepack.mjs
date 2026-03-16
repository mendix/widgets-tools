#!/usr/bin/env node

import { build } from "esbuild";

await build({
    entryPoints: ["node_modules/@mendix/widget-typings-generator/dist/index.js"],
    bundle: true,
    platform: "node",
    target: "node20",
    format: "cjs",
    outfile: "dist/widget-typings-generator.js",
    external: [],
    sourcemap: false
});
