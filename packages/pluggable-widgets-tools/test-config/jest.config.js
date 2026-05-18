const { join } = require("path");

const projectDir = process.cwd();

module.exports = {
    clearMocks: true,
    testRunner: "jest-circus/runner",
    testTimeout: 10000,
    rootDir: join(projectDir, "src"),
    setupFilesAfterEnv: [join(__dirname, "test-index.js")],
    testMatch: ["<rootDir>/**/*.spec.{js,jsx,ts,tsx}"],
    transform: {
        "^.+\\.(t|j)sx?$": [
            "@swc/jest",
            {
                jsc: {
                    transform: { react: { runtime: "automatic" } },
                    parser: { syntax: "typescript", tsx: true, decorators: true },
                    target: "es2019"
                },
                module: { type: "commonjs" }
            }
        ],
        "^.+\\.svg$": join(__dirname, "jest-svg-transformer")
    },
    moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
        "mendix/components/web/Icon": join(__dirname, "__mocks__/WebIcon"),
        "mendix/filters/builders": join(__dirname, "__mocks__/FilterBuilders"),
        "\\.png$": join(__dirname, "assetsTransformer.js"),
        "react-hot-loader/root": join(__dirname, "__mocks__/hot")
    },
    moduleDirectories: ["node_modules", join(projectDir, "node_modules")],
    collectCoverage: !process.env.CI,
    coverageDirectory: join(projectDir, "dist/coverage"),
    testEnvironment: "jsdom"
};
