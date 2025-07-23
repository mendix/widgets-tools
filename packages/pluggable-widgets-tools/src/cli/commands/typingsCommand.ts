import { CommandModule } from "yargs";

export const typings: CommandModule<{}, {}> = {
    command: "typings",
    describe: "Generates types according to a widget's xml definition",
    handler(args) {
        console.log("Type all the things!")
    },
}


