import type { RolldownOptions } from "rolldown";
import pkg from "./package.json" with { type: "json" };

const config: RolldownOptions = {
    input: "./src/cli.ts",
    external: [Object.keys(pkg.dependencies ?? {})].flat(),
    output: {
        file: "./dist/mpx.js",
        inlineDynamicImports: true,
        minify: false
    },
    platform: "node",
    treeshake: true
};

export default config;
