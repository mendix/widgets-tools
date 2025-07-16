#!/usr/bin/env node

import { cac } from "cac";
import { env } from "node:process";
import { build } from "./build.js";
import { VERSION } from "./constants.js";

const name = "mpx";
const cli = cac(name);
cli.usage(
    `[options] [dir] \n\nBuild the widget in the specified directory. If the directory is omitted, use the current directory.`
);

cli.option("-w, --watch", "watch for changes and rebuild", { default: false })
    .option("-m, --minify", "minify the output (this option is 'on' in CI environment)", { default: Boolean(env.CI) })
    .option("-p, --platform <platform>", "build platform (web or node)", { default: "web" });

cli.help();
cli.version(VERSION);

const {
    args: [root],
    options
} = cli.parse();

if (options.help || options.version) {
    process.exit(0);
}

build(root, options);

process.on("uncaughtException", error => {
    console.error("Uncaught Exception:", error.message);
    process.exit(1);
});
