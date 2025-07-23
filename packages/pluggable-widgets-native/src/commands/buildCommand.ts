import { CommandModule } from "yargs";

export const build: CommandModule<{}, { "watch": boolean }> = {
	command: "build",
	describe: "Builds the pluggable widget for native",
	builder: yargs => yargs.option("watch", {
		alias: "w",
		type: "boolean",
		default: false,
		describe: "Enables watch mode"
	}
	),
	handler(args) {
		console.log("Build all the native things!")
		if (args.watch) {
			console.log("👀👀👀👀👀👀👀")
		}
	},
}


