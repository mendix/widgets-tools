#!/usr/bin/env node

const { execSync } = require("child_process");
const version = process.env.npm_package_version;

const args = process.argv.slice(2);
execSync(`npm install -g yo @mendix/generator-widget@${version}`);
execSync(`yo @mendix/widget@${version} ${args.join(" ")}`, { stdio: "inherit" });
