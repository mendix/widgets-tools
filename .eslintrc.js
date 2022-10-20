module.exports = {
    ignorePatterns: ["scripts/release/utils/changelog-parser/parser/widget/widget.js"],
    rules: {
        "@typescript-eslint/ban-ts-ignore": "off",
        "no-unused-expressions": "off",
        "@typescript-eslint/no-unused-expressions": "error",
        "no-undef": "off"
    },
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier", "plugin:prettier/recommended"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./scripts/tsconfig.json",
        ecmaVersion: 2018,
        sourceType: "module"
    },
    plugins: ["@typescript-eslint"]
};
