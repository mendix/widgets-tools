import { readFile, opendir } from "node:fs/promises";
import yargs, { CommandModule } from "yargs"
import { hideBin } from "yargs/helpers"
import * as commands from "./commands/index.js"
import { join } from "node:path";

async function getPackageInfo(): Promise<{ name: string, version: string }> {
    const packagePath = new URL('../../package.json', import.meta.url)
    const packageRaw = await readFile(packagePath.pathname, 'utf-8')
    return await JSON.parse(packageRaw);
}

async function discoverModules(): Promise<CommandModule[]> {
    const mendixNamespace = new URL('../../..', import.meta.url).pathname
    const mendixPackages = await opendir(mendixNamespace)


    let packagepaths = []
    for await (const dirent of mendixPackages) {
        if (dirent.name.startsWith('pluggable-widgets-') && dirent.name != "pluggable-widgets-tools") {
            packagepaths.push(new URL('../../../' + dirent.name, import.meta.url).pathname)
        }
    }

    return (await Promise.all(packagepaths.map(async path => {
        const mod = await import(join(path, 'dist/index.js'));
        if ('commands' in mod) {
            return Object.values(mod.commands) as CommandModule[]
        }
        return []
    }))).flat();
}

let program = yargs()
    .scriptName("mxwidgets")
    .middleware([
        async () => {
            const info = await getPackageInfo()
            console.info("Starting %s@%s", info.name, info.version)
        }
    ])
    .help();

export async function main() {
    const builtins = Object.values(commands);
    const externals = await discoverModules();
    const modulesByCommands: { [cmd: string]: CommandModule } = [...builtins, ...externals].reduce((cmds, c) => ({ ...cmds, [c.command?.toString() ?? ""]: c }), {})
    const info = await getPackageInfo()
    await program
        .command(Object.values(modulesByCommands))
        .version(info.version)
        .parse(hideBin(process.argv));
}
