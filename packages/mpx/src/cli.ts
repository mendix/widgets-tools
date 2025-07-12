#!/usr/bin/env node

import { cac } from "cac";
import { actionBuild } from "./build.js";
import { VERSION } from "./constants.js";

const cli = cac("mpx");

cli.command("dev [root]", "Run build in watch mode").action(actionBuild);
// cli.command("build", "Create production build").action(build);

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
