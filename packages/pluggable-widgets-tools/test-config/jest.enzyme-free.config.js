const { join } = require("path");

const projectDir = process.cwd();

module.exports = {
    clearMocks: true,
    testRunner: "jest-jasmine2",
    rootDir: join(projectDir, "src"),
    setupFilesAfterEnv: [join(__dirname, "test-index-no-enzyme.js")],
    testMatch: ["<rootDir>/**/*.spec.{js,jsx,ts,tsx}"],
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                tsconfig: { module: "commonjs", target: "ES2019" },
            }
        ],
        "^.+\\.jsx?$": join(__dirname, "transform.js"),
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
