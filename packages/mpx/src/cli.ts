#!/usr/bin/env node

import { cac } from "cac";
import { buildCommand } from "./build.js";
import { VERSION } from "./constants.js";

const cli = cac("mpx");

cli.command("build [root]", "Build widget")
    .option("-w, --watch", "watch for changes and rebuild")
    .option("-m, --minify", "minify the output (this option is on in CI environment)")
    .action(buildCommand);

cli.help();
cli.version(VERSION);

cli.on("command:*", () => {
    console.error(`Unknown command: "%s"`, cli.args.join(" "));
    console.error("See 'mpw --help' for a list of available commands.");
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

// process.on("unhandledRejection", (reason, promise) => {
//     console.error("Unhandled Rejection at:", promise, "reason:", reason);
// });
