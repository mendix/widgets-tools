import { readFileSync } from "node:fs";

const { version } = JSON.parse(readFileSync(new URL("../package.json", import.meta.url)).toString());

export const VERSION = version as string;

export const STD_EXTERNALS = [
    // "mendix" and internals under "mendix/"
    /^mendix($|\/)/,
    /^react$/,
    /^react\/jsx-runtime$/,
    /^react-dom$/,
    /^big.js$/
];

export const WIDGET_ASSETS = ["src/*.xml", "src/*.@(tile|icon)?(.dark).png"];
