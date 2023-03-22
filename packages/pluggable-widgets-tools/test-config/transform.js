module.exports = require("babel-jest").createTransformer({
    presets: [
        ["@babel/preset-env", { "modules": "auto" }],
        "@babel/preset-react"
    ],
    plugins: [
        "@babel/plugin-proposal-class-properties",
        "@babel/plugin-proposal-private-methods",
        ["@babel/plugin-transform-react-jsx", { pragma: "createElement" }]
    ]
});
