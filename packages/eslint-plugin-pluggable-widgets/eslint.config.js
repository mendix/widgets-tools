import js from "@eslint/js";
import n from "eslint-plugin-n";
import eslintPlugin from "eslint-plugin-eslint-plugin";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js, n, eslintPlugin },
    extends: ["js/recommended", "n/recommended", "eslintPlugin/recommended"],
    languageOptions: { globals: globals.browser },
    rules: { "n/no-unpublished-import": "warn" }
  },
]);
