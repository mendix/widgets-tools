const webBaseConfig = require("./test-config/jest.config.js");
const nativeBaseConfig = require("./test-config/jest.native.config.js");
const { join } = require("path");

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

const nativeConfig = {
    ...nativeBaseConfig,
    rootDir: ".",
    testMatch: ["<rootDir>/src/native/**/*.spec.{ts,tsx}"]
};
delete nativeConfig.collectCoverage;
delete nativeConfig.coverageDirectory;

module.exports = {
    collectCoverage: !process.env.CI,
    coverageDirectory: join(process.cwd(), "dist/coverage"),
    projects: [webConfig, nativeConfig]
};
