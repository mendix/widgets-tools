const { existsSync, readdirSync, readFileSync, statSync } = require("fs");
const { join } = require("path");
const { yellow } = require("ansi-colors");

function checkForEnzymeUsage(srcDir = "src") {
    const projectRoot = process.cwd();
    const srcPath = join(projectRoot, srcDir);

    if (!existsSync(srcPath)) {
        return;
    }

    const enzymeFiles = [];

    function scanDirectory(dir) {
        try {
            const entries = readdirSync(dir);
            for (const entry of entries) {
                const fullPath = join(dir, entry);
                const stat = statSync(fullPath);

                if (stat.isDirectory()) {
                    scanDirectory(fullPath);
                } else if (
                    stat.isFile() &&
                    (entry.endsWith(".js") ||
                        entry.endsWith(".jsx") ||
                        entry.endsWith(".ts") ||
                        entry.endsWith(".tsx"))
                ) {
                    const content = readFileSync(fullPath, "utf8");
                    // Check for enzyme imports or requires
                    if (
                        /from\s+['"]enzyme['"]/.test(content) ||
                        /require\s*\(\s*['"]enzyme['"]\s*\)/.test(content) ||
                        /import\s+.*\s+from\s+['"]enzyme['"]/.test(content) ||
                        /shallow|mount|render/.test(content) && /enzyme/.test(content)
                    ) {
                        enzymeFiles.push(fullPath.replace(projectRoot, "."));
                    }
                }
            }
        } catch (error) {

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

module.exports = { checkForEnzymeUsage };
