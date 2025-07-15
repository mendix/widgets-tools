import pkg from "../package.json" with { type: "json" };

export const VERSION = pkg.version as string;

export const STD_EXTERNALS = [
    // "mendix" and internals under "mendix/"
    /^mendix($|\/)/,
    /^react$/,
    /^react\/jsx-runtime$/,
    /^react-dom$/,
    /^big.js$/
];

export const PACKAGE_FILES = [
    // XML files
    "src/*.xml",
    // Modeler icons
    "src/*.@(tile|icon)?(.dark).png",
    // License file
    "{licen[cs]e,LICEN[CS]E}?(.*)"
];
