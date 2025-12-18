import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
import { yellow } from "ansi-colors";

export function checkForEnzymeUsage(srcDir: string = "src"): void {
    const projectRoot = process.cwd();
    const srcPath = join(projectRoot, srcDir);

    if (!existsSync(srcPath)) {
        return;
    }

    const enzymeFiles: string[] = [];

    function scanDirectory(dir: string): void {
        try {
            const entries = readdirSync(dir);

            for (const entry of entries) {
                const fullPath = join(dir, entry);
                const stat = statSync(fullPath);

                if (stat.isDirectory()) {
                    scanDirectory(fullPath);
                    continue;
                }

                const isJsOrTsFile = /\.(jsx?|tsx?)$/.test(entry);
                if (!stat.isFile() || !isJsOrTsFile) {
                    continue;
                }

                const content = readFileSync(fullPath, "utf8");
                if (
                    /(from|require\s*\()\s*['"]enzyme['"]|enzyme.*(?:shallow|mount|render)|(?:shallow|mount|render).*enzyme/.test(
                        content
                    )
                ) {
                    enzymeFiles.push(fullPath.replace(projectRoot, "."));
                }
            }
        } catch (error) {
            console.error(`Error scanning directory ${dir}:`, error);
        }
    }

    scanDirectory(srcPath);

    if (enzymeFiles.length > 0) {
        console.log(yellow("\n WARNING: Enzyme usage detected in your tests"));
        console.log(
            yellow(
                "Enzyme is no longer supported. Please migrate your tests to React Testing Library."
            )
        );
        console.log(yellow("\nFiles with potential Enzyme usage:"));
        enzymeFiles.forEach(file => console.log(yellow(` ${file}`)));
        console.log(
            yellow(
                "\nFor migration guidance, see: https://testing-library.com/docs/react-testing-library/migrate-from-enzyme"
            )
        );
        console.log();
    }
}
