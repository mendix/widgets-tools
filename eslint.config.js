import js from "@eslint/js";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";
import jest from "eslint-plugin-jest";
import tseslint from "typescript-eslint";
import prettierRecommended from "eslint-plugin-prettier/recommended";

export default defineConfig(
    globalIgnores([
        "packages/generator-widget/generators/app/templates/**",
        "packages/pluggable-widgets-tools/dist/**"
    ]),
    {
        files: ["**/*.js", "**/*.mjs"],
        ignores: ["packages/release-tools/utils/changelog-parser/changelog.js"],
        plugins: { js },
        extends: ["js/recommended"],
        languageOptions: { globals: globals.node },
        rules: {
            "no-unused-vars": ["error", { argsIgnorePattern: "^_" }]
        }
    },
    {
        files: ["**/*.ts"],
        plugins: { tseslint },
        extends: ["tseslint/recommended"],
        languageOptions: { globals: globals.node },
        rules: {
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }]
        }
    },
    {
        files: ["**/__mocks__/**/*.js", "**/__tests__/**/*.js", "packages/pluggable-widgets-tools/test-config/**"],
        plugins: { jest },
        languageOptions: { globals: jest.environments.globals.globals }
    },
    { ...prettierRecommended, rules: { "prettier/prettier": process.env.CI ? "error" : "warn" } }
);
