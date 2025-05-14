#!/usr/bin/env node
var { join } = require("path");
const chalk = require("chalk");

console.log(chalk.bold.blueBright("Initializing the widget generator..."));
const yeoman = require('yeoman-environment');
const env = yeoman.createEnv();
env.register(join(__dirname, "./generators/app/index.js"), "@mendix/widget");

const args = process.argv.slice(2);
env.run(['@mendix/widget', ...args].join(" "))
