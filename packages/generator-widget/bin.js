#!/usr/bin/env node

const { readFileSync } = require("fs");
var { join } = require("path");
const { execSync } = require("child_process");
const chalk = require("chalk");

const packageJson = readFileSync(join(__dirname, "package.json"));
const version = JSON.parse(packageJson).version;
const args = process.argv.slice(2);

console.log(chalk.bold.blueBright("Running widget generator..."));
execSync(`npm install -g yo @mendix/generator-widget@${version}`);
execSync(`yo @mendix/widget@${version} ${args.join(" ")}`, { stdio: "inherit" });
