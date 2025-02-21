const webBaseConfig = require("./test-config/jest.config.js");
const nativeBaseConfig = require("./test-config/jest.native.config.js");
const cliBaseConfig = require("./test-config/jest.cli.config.js");
const { join } = require("path");

/** @type {import('jest').Config} */
const cliConfig = {
    ...cliBaseConfig,
    rootDir: ".",
    testMatch: ["<rootDir>/src/cli/**/*.spec.ts"]
};

/** @type {import('jest').Config} */
const webConfig = {
    ...webBaseConfig,
    rootDir: ".",
    testMatch: [
        "<rootDir>/src/web/**/*.spec.{ts,tsx}",
        "<rootDir>/src/typings-generator/**/*.spec.{ts,tsx}",
        "<rootDir>/src/utils/**/*.spec.{ts,tsx}"
    ]
};
delete webConfig.collectCoverage;
delete webConfig.coverageDirectory;

/** @type {import('jest').Config} */
const nativeConfig = {
    ...nativeBaseConfig,
    rootDir: ".",
    testMatch: ["<rootDir>/src/native/**/*.spec.{ts,tsx}"]
};
delete nativeConfig.collectCoverage;
delete nativeConfig.coverageDirectory;

/** @type {import('jest').Config} */
module.exports = {
    collectCoverage: !process.env.CI,
    coverageDirectory: join(process.cwd(), "dist/coverage"),
    projects: [webConfig, nativeConfig, cliConfig]
};
