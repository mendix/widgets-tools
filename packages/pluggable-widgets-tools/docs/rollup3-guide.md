
# Rollup 3 Upgrade Guide

In 10.18 we upgraded the Rollup bundling setup from major version 2 to 3. If your widget uses custom configurations you may need to perform some actions.

1. Ensure you are using node 20 or above.
2. Upgrade any Rollup related package to their latest (Rollup 3 supporting) version: `npm install <package-name>@latest`.
3. Update your custom rollup configuration:
  - If your rollup configuration imports our base rollup configuration, rename the import to `@mendix/pluggable-widgets-tools/configs/rollup.config.mjs`.
  - Rollup now offers native support for ECMAScript Modules (ESM) for Rollup configuration. This does mean it is stricter with regards to ESM and CJS, ensure that:
    - If you are using ESM to use the `.mjs` extension for your `rollup.config.mjs` file.
    - If you are using CJS you can continue using the `.js` extension for your `rollup.config.js` file.

## ECMAScript Module Caveats 

If you decide to continue using ES Modules for your rollup configuration, there are [some caveats to be aware of](https://rollupjs.org/command-line-interface/#caveats-when-using-native-node-es-modules). Below we highlight a few.

### Rollup Config Filenames

When using ESM you should rename your Rollup configuration files to `.mjs`. This tells node to expect ESM for that particular file. Import statements targeting local files should be updated to include the file extension.

### Importing CommonJS files

When importing some CJS packages you may no longer be able to access individual named exports directly. In this case you will need to import the full module. You can [desctructure](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) the module to keep the rest of your implementation the same.

```js
// Partial import
import { cp } from "shelljs";
// Full namespace import
import shelljs from "shelljs";
const { cp } = shelljs;
```

### __Dirname

In ESM files the `__dirname` variable is not available. Instead, you can access the current file's path using `import.meta.url`. Do note that this includes the `file:` protocol prefix. An easy way to work with the file's url is to use it as the [base value for the URL constructor](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL#base). This will allow you to resolve a relative path from that path. For example `new URL("../", "file:/a/b/c.txt")` results in the URL `file:/a`.

```js
// ESM equivalent of __dirname
const dirname = new URL("./", import.meta.url).pathname;
```

### Absense of require()

Also note that `require()` is unavailable in ESM files. A common usecase for rollup setups is accessing the package.json of a project. If this is a static location relative to the script, you may use a typed import. Otherwise, read the file from the file system and parse it as JSON.

```js
// CJS method
import { join } from "node:path";
const packagePath = join(process.cwd(), "/package.json");
const package = require(packagePath);

// ESM import with attributes
import package from "../package.json" with { type: "json" }

// Dynamic import with attributes
const package = await import(packagePath, { with: { type: "json" }})

// Read file and parse (async version with fs.readFile)
import { readFileSync } from "node:fs"
const package = JSON.parse(readFileSync(packagePath))
```


