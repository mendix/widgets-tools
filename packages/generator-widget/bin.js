#!/usr/bin/env node
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import { createEnv } from "yeoman-environment";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(chalk.bold.blueBright("Initializing the widget generator..."));
const env = createEnv();
env.register(join(__dirname, "./generators/app/index.js"), "@mendix/widget");

const args = process.argv.slice(2);
env.run(['@mendix/widget', ...args].join(" "))


