import { readFileSync } from "fs";

const basePath = new URL("./packages/pluggable-widgets-tools/configs/prettier.base.json", import.meta.url).pathname;
const base = JSON.parse(readFileSync(basePath));

export default {
    ...base,
    plugins: ["@prettier/plugin-xml"],
    overrides: [
        {
            files: ["CHANGELOG.md"],
            options: {
                proseWrap: "preserve"
            }
        },
        {
            files: "package.json",
            options: {
                tabWidth: 2
            }
        },
        {
            files: "package-lock.json",
            options: {
                tabWidth: 4,
                useTabs: false
            }
        },
        {
            files: "*.md",
            options: {
                proseWrap: "preserve"
            }
        },
        {
            files: "*.xml",
            options: {
                printWidth: 500
            }
        },
        {
            files: ["*.yaml", "*.yml"],
            options: {
                tabWidth: 2,
                // Disable line wrapping in .yml files
                printWidth: 99999
            }
        }
    ]
};
