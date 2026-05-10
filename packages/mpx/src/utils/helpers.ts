import { Dependency } from "rollup-plugin-license";

export function licenseCustomTemplate(dependencies: Dependency[]) {
    return JSON.stringify(
        dependencies.map(dependency => {
            const repoUrl =
                typeof dependency.repository === "string"
                    ? dependency.repository
                    : dependency.repository instanceof Object
                      ? dependency.repository.url
                      : undefined;

            return {
                [dependency.name!]: {
                    version: dependency.version,
                    url: dependency.homepage ?? repoUrl
                }
            };
        })
    );
}
