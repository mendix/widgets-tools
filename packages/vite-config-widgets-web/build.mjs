import * as esbuild from "esbuild";

await esbuild.build({
    entryPoints: ["config.web.ts"],
    bundle: true,
    platform: "node",
    format: "esm",
    outfile: "dist/config.web.mjs",
    external: ["vite", "archiver"],
});

console.log("✓ Built dist/config.web.mjs");
