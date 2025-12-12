import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import pluginWidgets from "@mendix/eslint-plugin-pluggable-widgets"

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js, pluginWidgets },
    extends: ["js/recommended"],
    rules: {
      "pluginWidgets/no-react-19-editor-preview": "error"
    },
    languageOptions: { globals: globals.browser }
  },
  pluginReact.configs.flat.recommended,
]);
