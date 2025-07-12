import type { RolldownOptions } from "rolldown";

const config: RolldownOptions = {
    input: "./src/cli.ts",
    external: ["rolldown", "arktype"],
    output: {
        file: "./dist/mpx.js",
        inlineDynamicImports: true,
        minify: false
    },
    platform: "node",
    treeshake: true
};

export default config;
