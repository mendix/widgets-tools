#!/usr/bin/env node

import { cac } from "cac";
import { build } from "./build.js";
import { VERSION } from "./constants.js";

const name = "mpx";
const cli = cac(name);

cli.command("build [root]", "Build widget")
    .option("-w, --watch", "watch for changes and rebuild")
    .option("-m, --minify", "minify the output (this option is on in CI environment)")
    .action(build);

cli.help();
cli.version(VERSION);

cli.on("command:*", () => {
    console.error(`Unknown command: "%s"`, cli.args.join(" "));
    console.error(`See '${name} --help' for a list of available commands.`);
    process.exit(1);
});

cli.parse();

if (process.argv.length <= 2) {
    cli.outputHelp();
    process.exit(1);
}

process.on("uncaughtException", error => {
    console.error("Uncaught Exception:", error.message);
    process.exit(1);
});
