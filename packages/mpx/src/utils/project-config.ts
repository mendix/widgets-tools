import path from "node:path";
import { env } from "node:process";
import { access } from "./fs.js";
import { PackageJson } from "./parsers/PackageJson.js";

/** Files located in src directory */
interface BundleInputFiles {
    editorConfig: string;
    editorPreview: string;
    packageXml: string;
    widgetFile: string;
    widgetXml: string;
}

/** Files for that will be in final build output */
interface BundleOutputFiles {
    editorConfig: string;
    editorPreview: string;
    esm: string;
    umd: string;
    mpk: string;
}

interface BundleOutputDirs {
    dist: string;
    mpkDir: string;
    contentRoot: string;
    widgetDir: string;
}

interface ProjectConfigInputs {
    pkg: PackageJson;
    isTsProject: boolean;
}

export class ProjectConfig {
    /** Output directory for built files */
    readonly dist = "dist";
    /** Package root directory that contains all widget files shipped with mpk */
    readonly contentRoot = path.join(this.dist, "tmp", "widgets");
    /** Widget package.json */
    readonly pkg: PackageJson;
    readonly isTsProject: boolean;

    constructor(inputs: ProjectConfigInputs) {
        this.pkg = inputs.pkg;
        this.isTsProject = inputs.isTsProject;
    }

    get inputFiles(): BundleInputFiles {
        const { pkg, isTsProject } = this;
        const ext = isTsProject ? "ts" : "js";
        const extJsx = isTsProject ? "tsx" : "jsx";

        const editorConfig = path.format({
            dir: "src",
            name: pkg.widgetName,
            ext: `editorConfig.${ext}`
        });

        const editorPreview = path.format({
            dir: "src",
            name: pkg.widgetName,
            ext: `editorPreview.${extJsx}`
        });

        const packageXml = path.format({
            dir: "src",
            base: "package.xml"
        });

        const widgetFile = path.format({
            dir: "src",
            name: pkg.widgetName,
            ext: extJsx
        });

        const widgetXml = path.format({
            dir: "src",
            name: pkg.widgetName,
            ext: "xml"
        });

        return { editorConfig, editorPreview, packageXml, widgetFile, widgetXml };
    }

    /** Directory where widget bundles will be output */
    get widgetDir(): string {
        const { pkg, contentRoot } = this;
        return path.join(contentRoot, ...pkg.packagePath.split("."), pkg.widgetName.toLowerCase());
    }

    get outputDirs(): BundleOutputDirs {
        return {
            dist: this.dist,
            mpkDir: path.join(this.dist, this.pkg.version),
            contentRoot: this.contentRoot,
            widgetDir: this.widgetDir
        };
    }

    get outputFiles(): BundleOutputFiles {
        const { pkg, outputDirs } = this;
        return {
            esm: path.format({
                dir: outputDirs.widgetDir,
                name: pkg.widgetName,
                ext: "mjs"
            }),
            umd: path.format({
                dir: outputDirs.widgetDir,
                name: pkg.widgetName,
                ext: "js"
            }),
            editorConfig: path.format({
                dir: outputDirs.contentRoot,
                name: pkg.widgetName,
                ext: `editorConfig.js`
            }),
            editorPreview: path.format({
                dir: outputDirs.contentRoot,
                name: pkg.widgetName,
                ext: `editorPreview.js`
            }),
            mpk: path.format({
                dir: outputDirs.mpkDir,
                base: `${pkg.packagePath}.${pkg.widgetName}.mpk`
            })
        };
    }

    async getProjectPath(): Promise<string | undefined> {
        const { pkg } = this;
        const projectPath = (() => {
            if (env.MX_PROJECT_PATH) {
                return env.MX_PROJECT_PATH;
            }
            if (pkg.config?.projectPath) {
                return pkg.config.projectPath;
            }

            return path.join("tests", "testProject");
        })();

        if (await access(projectPath)) {
            return projectPath;
        }
    }
}
