import type { RolldownOptions } from "rolldown";

const config: RolldownOptions = {
    input: "./src/cli.ts",
    external: ["rolldown"],
    output: {
        file: "./bin/mpw.js",
        inlineDynamicImports: true
    },
    platform: "node"
};

export default config;
