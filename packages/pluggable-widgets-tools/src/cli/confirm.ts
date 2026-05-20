import { bold, gray, green, symbols, whiteBright } from "ansi-colors";
import { createInterface } from "readline";

export async function confirm(prompt: string, defaultAnswer: boolean = true): Promise<boolean> {
    const rl = createInterface(process.stdin, process.stdout)
    return ask().finally(() => {
        process.stdout.write("\n")
        rl.close()
    })

    function ask() {
        return new Promise<boolean>((resolve) => {
            rl.question(`${green(symbols.question)} ${bold(whiteBright(prompt))} ${gray(defaultAnswer ? "(Yes/no)" : "(yes/No)")} `, (answer) => {
                if (answer.trim() === "") {
                    resolve(defaultAnswer);
                }
                else if (/^ye?s?$/i.test(answer)) {
                    resolve(true);
                }
                else if (/^no?$/i.test(answer)) {
                    resolve(false);
                }
                else {
                    resolve(ask())
                }
            })
        })
    }
}

