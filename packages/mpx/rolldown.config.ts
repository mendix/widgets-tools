import type { RolldownOptions } from "rolldown";
import pkg from "./package.json" with { type: "json" };

const external = [
    ...[Object.keys(pkg.dependencies ?? {})].flat()
    // ...[Object.keys(pkg.peerDependencies ?? {})].flat()
];

const config: RolldownOptions = {
    input: "./src/cli.ts",
    external,
    output: {
        file: "./dist/mpx.js",
        inlineDynamicImports: true,
        minify: true
    },
    platform: "node",
    treeshake: true
};

export default config;
