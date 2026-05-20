import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import eslintPluginPrettier from "eslint-plugin-prettier";

export default defineConfig([
  {
    files: ["**/*.js"],
    ignores: ["generators/app/templates/**"],
    plugins: { js, eslintPluginPrettier },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.node },
  },
]);
