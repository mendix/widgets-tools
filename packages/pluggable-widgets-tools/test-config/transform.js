module.exports = require("babel-jest").createTransformer({
    presets: [
        ["@babel/preset-env", { "modules": "auto" }],
        "@babel/preset-react"
    ],
    plugins: [
        "@babel/plugin-transform-class-properties",
        "@babel/plugin-transform-private-methods",
        ["@babel/plugin-transform-react-jsx", { pragma: "createElement" }]
    ]
});
