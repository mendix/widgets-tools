const { join } = require("path");
const fs = require("fs/promises");

const ejs = require("ejs");

describe("[template] packages/package_web", () => {
    const template = join(__dirname, "../package_web.json.ejs");
    const configs = [
        { config: ["js"] },
        { config: ["js", "unit"] },
        { config: ["js", "e2e"] },
        { config: ["js", "unit", "e2e"] },
        { config: ["ts"] },
        { config: ["ts", "unit"] },
        { config: ["ts", "e2e"] },
        { config: ["ts", "unit", "e2e"] }
    ];

    const prepare = options => ({
        packageName: "Widget test",
        name: "Widget test",
        description: "Widget description",
        organization: "com.mendix",
        copyright: "Mendix 2023",
        license: "Apache-2.0",
        version: "1.0.0",
        author: "Jest",
        projectPath: "./dist/MxTestProject",
        packagePath: "mendix",
        ...options
    });

    it.each(configs)("should correctly render a package.json for the config: $config", async ({ config }) => {
        const data = prepare({
            isLanguageTS: config.includes("ts"),
            hasUnitTests: config.includes("unit"),
            hasE2eTests: config.includes("e2e")
        });

        const snapshotPath = `./outputs/package_web.json-${config.join("-")}.json`;
        const expectedOutput = await fs.readFile(join(__dirname, snapshotPath), { encoding: "utf8" });

        const result = await ejs.renderFile(template, data);
        expect(result).toEqual(expectedOutput);
    });
});
