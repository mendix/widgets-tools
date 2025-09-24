const { join } = require("path");

const projectDir = process.cwd();

module.exports = {
    preset: "react-native",
    testRunner: "jest-jasmine2",
    clearMocks: true,
    haste: {
        defaultPlatform: "android",
        platforms: ["android", "ios", "native"]
    },
    rootDir: join(projectDir, "src"),
    setupFilesAfterEnv: [
        join(__dirname, "test-index-native.js"),
        ...(hasDependency("react-native-gesture-handler") ? ["react-native-gesture-handler/jestSetup.js"] : []),
    ],
    testMatch: ["<rootDir>/**/*.spec.{js,jsx,ts,tsx}"],
    transformIgnorePatterns: ["node_modules/(?!(.*react-native.*|victory-)/)"],
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                tsconfig: { module: "commonjs", target: "ES2019" },
            }
        ],
        "^.+\\.jsx?$": join(__dirname, "transform-native.js")
    },
    moduleNameMapper: {
        "mendix/components/native/Icon": join(__dirname, "__mocks__/NativeIcon"),
        "mendix/components/native/Image": join(__dirname, "__mocks__/NativeImage"),
        "mendix/filters/builders": join(__dirname, "__mocks__/FilterBuilders"),
        "react-hot-loader/root": join(__dirname, "__mocks__/hot")
    },
    moduleDirectories: ["node_modules", join(projectDir, "node_modules")],
    coverageDirectory: join(projectDir, "dist/coverage"),
    testEnvironment: "jsdom"
};

function hasDependency(name) {
    try {
        require.resolve(name);
        return true;
    } catch (e) {
        return false;
    }
}
