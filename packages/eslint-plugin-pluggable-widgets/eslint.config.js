const js = require("@eslint/js");
const n = require("eslint-plugin-n");
const eslintPlugin = require("eslint-plugin-eslint-plugin");
const globals = require("globals");
const { defineConfig } = require("eslint/config");

const config = defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js, n, eslintPlugin },
    extends: ["js/recommended", "n/recommended"],
    languageOptions: { globals: globals.browser },
    rules: { "n/no-unpublished-import": "warn" }
  },
]);

module.exports = config
