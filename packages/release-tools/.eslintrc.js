module.exports = {
    ignorePatterns: ["utils/changelog-parser/changelog.js"],
    rules: {
        "@typescript-eslint/ban-ts-ignore": "off",
        "no-unused-expressions": "off",
        "@typescript-eslint/no-unused-expressions": "error",
        "no-undef": "off"
    },
    extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier", "plugin:prettier/recommended"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2018,
        sourceType: "module"
    },
    plugins: ["@typescript-eslint"]
};
