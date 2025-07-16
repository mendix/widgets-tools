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
    dependenciesTxt: string;
    dependenciesJson: string;
}

interface BundleOutputDirs {
    dist: string;
    mpkDir: string;
    contentRoot: string;
    widgetDir: string;
    widgetAssetsDir: string;
}

interface ProjectConfigInputs {
    pkg: PackageJson;
    isTsProject: boolean;
}

export abstract class ProjectConfig {
    readonly projectPath: string | null = null;

    /** Output directory for built files */
    readonly dist = "dist";
    /** Package root directory that contains all widget files shipped with mpk */
    readonly contentRoot = path.join(this.dist, "tmp", "widgets");
    /** Widget package.json */
    readonly pkg: PackageJson;

    readonly isTsProject: boolean;

    readonly platform: "web" | "native";

    readonly deploymentPath: string[];

    constructor(
        inputs: ProjectConfigInputs & {
            projectPath: string | null;
            platform: "web" | "native";
            deploymentPath: string[];
        }
    ) {
        this.projectPath = inputs.projectPath;
        this.pkg = inputs.pkg;
        this.isTsProject = inputs.isTsProject;
        this.platform = inputs.platform;
        this.deploymentPath = inputs.deploymentPath;
    }

    /** Relative path to the widget directory from the "widgets" */
    get relativeWidgetPath(): string {
        return path.join(...this.pkg.packagePath.split("."), this.pkg.widgetName.toLowerCase());
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

    get outputDirs(): BundleOutputDirs {
        const widgetDir = path.join(this.contentRoot, this.relativeWidgetPath);
        return {
            dist: this.dist,
            mpkDir: path.join(this.dist, this.pkg.version),
            contentRoot: this.contentRoot,
            widgetDir,
            widgetAssetsDir: path.join(widgetDir, "assets")
        };
    }

    get outputFiles(): BundleOutputFiles {
        throw new Error("Method 'outputFiles' must be implemented.");
    }

    toPlainObject(): Record<string, unknown> {
        return {
            dist: this.dist,
            contentRoot: this.contentRoot,
            pkg: this.pkg,
            isTsProject: this.isTsProject,
            projectPath: this.projectPath,
            inputFiles: this.inputFiles,
            outputDirs: this.outputDirs,
            outputFiles: this.outputFiles,
            relativeWidgetPath: this.relativeWidgetPath
        };
    }

    static async getProjectPath(pkg: PackageJson): Promise<string | null> {
        let projectPath = (() => {
            if (env.MX_PROJECT_PATH) {
                return env.MX_PROJECT_PATH;
            }
            if (pkg.config?.projectPath) {
                return pkg.config.projectPath;
            }

            return path.join("tests", "testProject");
        })();
        projectPath = path.resolve(projectPath);

        if (await access(projectPath)) {
            return projectPath;
        }

        return null;
    }
}

export class ProjectConfigWeb extends ProjectConfig {
    constructor(inputs: ProjectConfigInputs, projectPath: string | null) {
        super({ ...inputs, projectPath, platform: "web", deploymentPath: ["deployment", "web", "widgets"] });
    }

    /** Public path (aka base url) for widget assets */
    get assetsPublicPath(): string {
        const {
            pkg: { packagePath, widgetName }
        } = this;
        const publicPath = ["widgets", ...packagePath.split("."), widgetName.toLowerCase(), "assets"].join("/");
        return `${publicPath}/`;
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
            }),
            dependenciesTxt: path.format({
                dir: outputDirs.contentRoot,
                base: "dependencies.txt"
            }),
            dependenciesJson: path.format({
                dir: outputDirs.contentRoot,
                base: "dependencies.json"
            })
        };
    }

    static async create(inputs: ProjectConfigInputs): Promise<ProjectConfigWeb> {
        const projectPath = await ProjectConfig.getProjectPath(inputs.pkg);
        return new ProjectConfigWeb(inputs, projectPath);
    }
}
