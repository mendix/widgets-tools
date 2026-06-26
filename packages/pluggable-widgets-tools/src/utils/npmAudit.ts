import assert from "node:assert";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { widgetRoot } from "../widget/paths";
import { ensure, partition } from "../common";
import { exec } from "node:child_process";

export type Report = {
    auditReportVersion: 2;
    vulnerabilities: {
        [name: PackageName]: Dependency;
    };
    metadata: {
        vulnerabilities: {
            info: number;
            low: number;
            moderate: number;
            high: number;
            critical: number;
            total: number;
        };
        dependencies: {
            prod: number;
            dev: number;
            optional: number;
            peer: number;
            peerOptional: number;
            total: number;
        };
    };
};

export type Severity = "info" | "low" | "moderate" | "high" | "critical";

export type PackageName = string & { _package: never };

export type Dependency = {
    name: PackageName;
    severity: Severity;
    isDirect: boolean;
    via: Array<Vulnerability | PackageName>;
    effects: PackageName[];
    range: string;
    nodes: string[];
    fixAvailable: boolean;
};

export type Vulnerability = {
    source: number;
    name: PackageName;
    dependency: PackageName;
    title: string;
    url: string;
    severity: Severity;
    cwe: string[];
    cvss: {
        score: number;
        vectorString: string;
    };
    range: string;
};

export function collectVulnerabilities(report: Report, rootDependency: PackageName): Vulnerability[] {
    const dependencies: PackageName[] = [rootDependency];
    const dependenciesSeen: PackageName[] = [];
    const allVulnerabilities: Vulnerability[] = [];

    while (dependencies.length > 0) {
        const dependencyName = ensure(dependencies.shift());
        dependenciesSeen.push(dependencyName);

        const [transients, vulnerabilities] = partition(
            report.vulnerabilities[dependencyName].via,
            v => typeof v === "string"
        );

        if (vulnerabilities.length > 0) {
            allVulnerabilities.push(...vulnerabilities);
            continue;
        }
        dependencies.push(...transients.filter(d => !dependenciesSeen.includes(d)));
    }

    return allVulnerabilities;
}

export async function run(): Promise<Report> {
    const packageLock = join(widgetRoot, "package-lock.json");
    assert(
        existsSync(packageLock),
        "Expected to find an npm lockfile. To run npm audit, dependencies must be installed with npm."
    );

    const { report, error } = await new Promise<string>((resolve, reject) => {
        exec("npm audit --json", (error, stdout, stderr) => {
            if (error && stderr.length > 0) {
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    })
        .then(json => ({ report: JSON.parse(json) as Report, error: undefined }))
        .catch(error => ({ error, report: undefined }));

    if (error) {
        throw error;
    }

    assert(report, `Expected an npm audit report, but received "${report}"`);
    assert(
        report.auditReportVersion === 2,
        `Expected npm audit report version 2, but received ${report.auditReportVersion}`
    );

    return report;
}
