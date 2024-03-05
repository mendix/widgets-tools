const { join } = require("path");
const { createInterface } = require("readline");
const { readJson, writeJson } = require("fs-extra");
const { execSync } = require("child_process");
const { red, green, yellow } = require("ansi-colors");
const { copyFileSync, existsSync, mkdirSync, readFile, promises } = require("fs");
const { parseStringPromise } = require("xml2js");
let requirePatch = false;

const CheckType = {
    MAJOR: (oldVersion, newVersion) => oldVersion[0] < newVersion[0],
    MINOR: (oldVersion, newVersion) => oldVersion[1] < newVersion[1],
    MAJOR_MINOR: (oldVersion, newVersion) =>
        oldVersion[0] < newVersion[0] || (oldVersion[0] === newVersion[0] && oldVersion[1] < newVersion[1])
};

const dependencies = [
    { name: "react", version: "remove", check: CheckType.MAJOR_MINOR },
    { name: "react-dom", version: "remove", check: CheckType.MAJOR_MINOR },
    { name: "react-native", version: "remove", check: CheckType.MINOR },
    { name: "@types/jest", version: "^29.0.0", check: CheckType.MAJOR },
    { name: "@types/react", version: "remove", check: CheckType.MAJOR },
    { name: "@types/react-native", version: "remove", check: CheckType.MINOR },
    { name: "@types/react-native-push-notification", version: "8.1.1", check: CheckType.MAJOR_MINOR },
    { name: "@types/react-dom", version: "remove", check: CheckType.MAJOR },
    { name: "@types/react-test-renderer", version: "18.0.0", check: CheckType.MAJOR },
    { name: "@types/enzyme-adapter-react-16", version: "remove", check: CheckType.MAJOR },
    { name: "@react-native-firebase/app", version: "17.3.0", check: CheckType.MAJOR_MINOR },
    { name: "@react-native-firebase/messaging", version: "17.3.0", check: CheckType.MAJOR_MINOR },
    {
        name: "react-native-camera",
        version: "3.40.0",
        check: CheckType.MAJOR_MINOR,
        patch: "react-native-camera+3.40.0.patch"
    },
    {
        name: "react-native-gesture-handler",
        version: "1.10.3",
        check: CheckType.MAJOR_MINOR,
        patch: "react-native-gesture-handler+1.10.3.patch"
    },
    { name: "react-native-image-picker", version: "5.0.1", check: CheckType.MAJOR },
    { name: "react-native-maps", version: "0.31.1", check: CheckType.MAJOR_MINOR },
    { name: "react-native-progress", version: "^5.0.0", check: CheckType.MAJOR },
    { name: "react-native-push-notification", version: "8.1.1", check: CheckType.MAJOR_MINOR },
    { name: "react-native-webview", version: "11.26.1", check: CheckType.MAJOR_MINOR }
];

const reactPackage = { version: "18.2.0", check: CheckType.MAJOR_MINOR };
const reactDomPackage = { version: "18.2.0", check: CheckType.MAJOR_MINOR };
const reactNativePackage = { version: "0.72.7", check: CheckType.MINOR };

const resolutionsOverrides = [
    { name: "react", ...reactPackage },
    { name: "react-dom", ...reactDomPackage },
    { name: "react-native", ...reactNativePackage },
    { name: "@types/react", ...reactPackage },
    { name: "@types/react-dom", ...reactDomPackage },
    { name: "@types/react-native", ...reactNativePackage }
];

function extractVersions(version) {
    return version.replace(/^\D+/, "").split(".").map(Number);
}

async function question(question) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve =>
        rl.question(yellow(question), answer => {
            rl.close();
            resolve(!answer ? "y" : answer.toLowerCase());
        })
    );
}

function getOutdatedDependencies(packageDependencies, listOfNewDependencies = dependencies) {
    return listOfNewDependencies
        .filter(dep => !!packageDependencies[dep.name])
        .map(dep => ({
            dep,
            oldVersion: extractVersions(packageDependencies[dep.name]),
            newVersion: dep.version !== "remove" ? extractVersions(dep.version) : undefined
        }))
        .filter(({ dep, oldVersion, newVersion }) => newVersion === undefined || dep.check(oldVersion, newVersion))
        .map(({ dep }) => ({
            name: dep.name,
            oldVersion: packageDependencies[dep.name],
            newVersion: dep.version,
            patch: dep.patch
        }));
}

function replaceOldDependencies(listOfOutdatedDependencies, packageJson, key) {
    if (listOfOutdatedDependencies.length > 0) {
        console.log(green(`The following ${key} were updated:`));
        listOfOutdatedDependencies.forEach(dep => {
            if (dep.newVersion === "remove") {
                delete packageJson[key][dep.name];
                console.log(green(`${dep.name}: ${red(dep.oldVersion)} -> ${yellow("(removed)")}`));
            } else {
                packageJson[key][dep.name] = dep.newVersion;

                if (!!dep.patch) {
                    const dir = join(process.cwd(), "patches");
                    if (!existsSync(dir)) {
                        mkdirSync(dir);
                    }
                    copyFileSync(join(__dirname, "../patches", dep.patch), join(process.cwd(), "patches", dep.patch));
                    requirePatch = true;
                }
                console.log(green(`${dep.name}: ${red(dep.oldVersion)} -> ${dep.newVersion}`));
            }
        });
    }
}

async function addExtraDependencies(packageJson, key) {
    const dependenciesToAdd = await getExtraDependencies(packageJson, key);
    if (dependenciesToAdd.length > 0) {
        console.log(green(`The following ${key} were added:`));
        packageJson[key] = packageJson[key] || {};
        dependenciesToAdd.forEach(dep => {
            packageJson[key][dep.name] = dep.version;
            console.log(green(`${dep.name}: ${dep.version}`));
        });
    }
}

async function getExtraDependencies(packageJson, key) {
    const sourceDir = process.cwd();
    const rawPackageXML = await promises.readFile(join(sourceDir, "src/package.xml"), 'utf-8');
    if (!rawPackageXML) {
        throw new Error("package.xml file was not found, please check your src folder");
    }

    const parsedPackageXML = await parseStringPromise(rawPackageXML);
    if (!parsedPackageXML) {
        throw new Error("Empty package.xml file, please check your src folder");
    }

    const widgetDefinitionXMLPaths = parsedPackageXML.package.clientModule[0].widgetFiles
        .map(wf => wf.widgetFile)
        .reduce((a, e) => a.concat(e), [])
        .filter(wfXml => wfXml.$.path);
    if (widgetDefinitionXMLPaths.length === 0)
        throw new Error("Path to the widget definition XML file(s) could not be found, please check your package.xml file")

    const parsedWidgetDefinitionXMLs = [];
    for (const widgetDefinitionXMLPath of widgetDefinitionXMLPaths) {
        const rawWidgetDefinitionXML = await promises.readFile(join(sourceDir, 'src/', widgetDefinitionXMLPath.$.path), 'utf-8');
        if (!rawWidgetDefinitionXML) {
            throw new Error(`Widget definition XML file (with path ${widgetDefinitionXMLPath}) could not be found, please check your src folder`)
        }
        const parsedWidgetDefinitionXML = await parseStringPromise(rawWidgetDefinitionXML);
        if (!parsedWidgetDefinitionXML) {
            throw new Error(`Widget definition XML file (with path ${widgetDefinitionXMLPath}) is empty, please check your src folder`)
        }
        parsedWidgetDefinitionXMLs.push(parsedWidgetDefinitionXML);
    }

    const supportedPlatforms = [];
    for (const parsedWidgetDefinitionXML of parsedWidgetDefinitionXMLs) {
        const supportedPlatform = parsedWidgetDefinitionXML.widget.$.supportedPlatform;
        if (!supportedPlatform) {
            throw new Error("supportedPlatform attribute is missing, please check your widget definition XML file");
        }
        supportedPlatforms.push(supportedPlatform);
    }

    let extraDependencies = resolutionsOverrides.filter(ov => !packageJson[key] || !packageJson[key][ov.name]);
    if (!supportedPlatforms.includes("Native"))
        extraDependencies = extraDependencies.filter(d => d.name !== "react-native" && d.name !== "@types/react-native")
    if (!supportedPlatforms.includes("Web"))
        extraDependencies = extraDependencies.filter(d => d.name !== "react-dom" && d.name !== "@types/react-dom");

    return extraDependencies;
}

async function checkMigration() {
    console.log("Checking if dependencies should be migrated...");
    const packageJsonPath = join(process.cwd(), "package.json");
    const packageJson = await readJson(packageJsonPath);
    const args = process.argv;
    if (!args.includes("--skip-migration") && process.env.CI !== "true") {
        const outdatedDependencies = getOutdatedDependencies(packageJson.dependencies || {});
        const outdatedDevDependencies = getOutdatedDependencies(packageJson.devDependencies || {});
        const outdatedOverrides = getOutdatedDependencies(packageJson.overrides || {}, resolutionsOverrides);
        const outdatedResolutions = getOutdatedDependencies(packageJson.resolutions || {}, resolutionsOverrides);
        if (
            outdatedDependencies.length > 0 ||
            outdatedDevDependencies.length > 0 ||
            outdatedOverrides.length > 0 ||
            outdatedResolutions.length > 0
        ) {
            const answer = await question(
                "Your widget contains outdated dependencies that will not work with this version of Pluggable Widgets Tools, do you want to upgrade it automatically? " +
                "Note that this operation will delete your node_modules folder and package-lock.json files and re-create them. [Y/n]: "
            );
            if (answer === "y") {
                try {
                    const newPackageJson = packageJson;

                    replaceOldDependencies(outdatedDependencies, newPackageJson, "dependencies");
                    replaceOldDependencies(outdatedDevDependencies, newPackageJson, "devDependencies");
                    replaceOldDependencies(outdatedOverrides, newPackageJson, "overrides");
                    replaceOldDependencies(outdatedResolutions, newPackageJson, "resolutions");

                    // We check if any dependency should be added in overrides/resolutions
                    await addExtraDependencies(newPackageJson, "overrides");
                    await addExtraDependencies(newPackageJson, "resolutions");

                    // If any package requires a patch we make sure to install patch-package and add the script
                    if (requirePatch) {
                        newPackageJson.devDependencies["patch-package"] ||= "^6.5.0";

                        if (!newPackageJson.scripts.postinstall) {
                            newPackageJson.scripts.postinstall = "patch-package";
                        } else if (!newPackageJson.scripts.postinstall.includes("patch-package")) {
                            newPackageJson.scripts.postinstall =
                                "patch-package && " + newPackageJson.scripts.postinstall;
                        }
                    }
                    // Writes the new package keeping the current format
                    await writeJson(packageJsonPath, newPackageJson, { spaces: 2 });
                    console.log("Deleting old dependencies...");
                    execSync("shx rm -rf ./{node_modules,package-lock.json}", { cwd: process.cwd(), stdio: "inherit" });
                    console.log("Done.");
                    execSync(`npm install`, { cwd: process.cwd(), stdio: "inherit" });
                } catch (e) {
                    console.log(red("An error occurred while auto updating your dependencies"));
                    console.error(e);
                }
            }
        } else {
            console.log(green("Dependencies up-to-date."));
        }
    } else {
        console.log(yellow("Skipping dependency migration"));
    }
}

module.exports = {
    checkMigration
};
