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
    css: string;
}

interface BundleOutputDirs {
    dist: string;
    tmpDir: string;
    mpkDir: string;
    contentRoot: string;
    widgetDir: string;
    widgetAssetsDir: string;
}

interface ProjectConfigInputs {
    pkg: PackageJson;
    isTsProject: boolean;
    minify: boolean;
}

export abstract class ProjectConfig {
    readonly projectPath: string | null = null;

    /** Widget package.json */
    readonly pkg: PackageJson;

    readonly isTsProject: boolean;

    readonly platform: "web" | "native";

    readonly deploymentPath: string[];

    /** MPK name including extension. */
    readonly mpkBase: string;

    readonly minify: boolean;

    constructor(
        inputs: ProjectConfigInputs & {
            projectPath: string | null;
            platform: "web" | "native";
            deploymentPath: string[];
        }
    ) {
        const { pkg } = inputs;
        this.projectPath = inputs.projectPath;
        this.pkg = pkg;
        this.isTsProject = inputs.isTsProject;
        this.platform = inputs.platform;
        this.deploymentPath = inputs.deploymentPath;
        this.mpkBase = env.MPKOUTPUT ?? `${pkg.packagePath}.${pkg.widgetName}.mpk`;
        this.minify = inputs.minify;
    }

    /**
     * Relative fs path to the widget directory from the "widgets".
     * Used to compute widget directory in dist.
     * Example: com\\mendix\\widget\\web\\accordion (on Windows)
     */
    get widgetDirectory(): string {
        return path.join(...this.pkg.packagePath.split("."), this.pkg.widgetName.toLowerCase());
    }

    /**
     * Public URL path. Used to compute asset urls.
     * Example: com/mendix/widget/web/accordion
     */
    get publicPath(): string {
        return [...this.pkg.packagePath.split("."), this.pkg.widgetName.toLowerCase()].join("/");
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
        // dist
        const dist = "dist";
        // dist/tmp
        const tmpDir = path.join(dist, "tmp");
        // dist/tmp/widgets
        const contentRoot = path.join(tmpDir, "widgets");
        // dist/tmp/widgets/com/mendix/my/awesome/button
        const widgetDir = path.join(contentRoot, this.widgetDirectory);
        // dist/x.y.z
        const mpkDir = path.join(dist, this.pkg.version);
        // dist/widgets/com/mendix/my/awesome/button/assets
        const widgetAssetsDir = path.join(widgetDir, "assets");

        return {
            dist,
            tmpDir,
            mpkDir,
            contentRoot,
            widgetDir,
            widgetAssetsDir
        };
    }

    get outputFiles(): BundleOutputFiles {
        throw new Error("Method 'outputFiles' must be implemented.");
    }

    toPlainObject(): Record<string, unknown> {
        return {
            dist: this.outputDirs.dist,
            contentRoot: this.outputDirs.contentRoot,
            pkg: this.pkg,
            isTsProject: this.isTsProject,
            projectPath: this.projectPath,
            inputFiles: this.inputFiles,
            outputDirs: this.outputDirs,
            outputFiles: this.outputFiles,
            widgetDirectory: this.widgetDirectory,
            publicPath: this.publicPath,
            mpkBase: this.mpkBase
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

    /**
     * Public path (aka base url) for widget assets.
     * Example: widgets/com/mendix/widget/web/accordion/assets
     */
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
                base: this.mpkBase
            }),
            dependenciesTxt: path.format({
                dir: outputDirs.contentRoot,
                base: "dependencies.txt"
            }),
            dependenciesJson: path.format({
                dir: outputDirs.contentRoot,
                base: "dependencies.json"
            }),
            css: path.format({
                dir: outputDirs.widgetDir,
                name: pkg.widgetName,
                ext: "css"
            })
        };
    }

    toPlainObject(): Record<string, unknown> {
        return {
            ...super.toPlainObject(),
            assetsPublicPath: this.assetsPublicPath
        };
    }

    static async create(inputs: ProjectConfigInputs): Promise<ProjectConfigWeb> {
        const projectPath = await ProjectConfig.getProjectPath(inputs.pkg);
        return new ProjectConfigWeb(inputs, projectPath);
    }
}
