#!/usr/bin/env node

import { cac } from "cac"
import { build } from "./build.js"
import { VERSION } from "./constants.js"

const cli = cac("mpw")

cli.command("build", "Build the project").action(build)

cli.help()
cli.version(VERSION)

if (process.argv.length === 2) {
    cli.outputHelp()
    process.exit(1)
}

cli.on("command:*", () => {
    console.error(`Unknown command: "%s"`, cli.args.join(" "))
    console.error("See 'mpw --help' for a list of available commands.")
    process.exit(1)
})

cli.parse()
