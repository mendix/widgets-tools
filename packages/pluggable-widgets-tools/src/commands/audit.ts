import { symbols, whiteBright, yellow, green, red, bold } from "ansi-colors";
import * as NpmAudit from "../utils/npmAudit";
import { promisify } from "node:util";
import { exec } from "node:child_process";
import { maxSatisfying, minSatisfying } from "semver";
import { confirm } from "../cli/confirm";
import { readFile, writeFile } from "node:fs";
import { join } from "node:path";

const pluggableWidgetsTools = "@mendix/pluggable-widgets-tools" as NpmAudit.PackageName;

export async function auditPluggableWidgetsTools(fix: boolean = false) {
    console.log("Checking pluggable-widgets-tools for vulnerabilities");
    const report = await NpmAudit.run();

    if (!(pluggableWidgetsTools in report.vulnerabilities)) {
        console.log(green("No vulnerabilities found for pluggable-widgets-tools"));
        reportOtherDirectVulnerabilities(report);
        return;
    }

    // Collect updateable, vulnerable packages installed by pwt
    const vulnerabilities = NpmAudit.collectVulnerabilities(report, report.vulnerabilities[pluggableWidgetsTools]);
    const vulnerableDependencies = vulnerabilities
        .map(v => v.name)
        .reduce((unique, p) => (unique.includes(p) ? unique : [...unique, p]), [] as NpmAudit.PackageName[]);
    const updateable = await Promise.all(
        vulnerableDependencies.map(name => report.vulnerabilities[name]).map(findSafeVersion)
    );

    // Check if PWT is vulnerable
    const updateablePwt = updateable.find(p => p.name === pluggableWidgetsTools);
    if (updateablePwt?.safeRange) {
        console.log(red("Found vulnerabilities in pluggable-widgets-tools %s"), updateablePwt.vulnerableRange);
        console.log(
            bold(whiteBright("Update @mendix/pluggable-widgets-tools to at least %s")),
            updateablePwt.safeRange
        );
        return;
    }

    // Report vulnerable dependencies
    console.log(
        yellow("Found %d dependencies with %d vulnerabilities"),
        vulnerableDependencies.length,
        vulnerabilities.length
    );
    updateable.forEach(p => {
        const update = p.safeRange
            ? green(`${symbols.pointerSmall} ${p.safeRange}`)
            : red(`${symbols.cross} No update available`);
        console.log(`    ${whiteBright(bold(p.name))}   ${p.vulnerableRange}  ${update}`);
    });

    // Add overrides for updateable dependencies
    if (
        updateable.some(p => p.safeRange) &&
        (fix || (await confirm("Add overrides to package.json for vulnerable packages?")))
    ) {
        console.log("Adding overrides");
        const packageJsonPath = join(process.cwd(), "package.json");
        const widgetPackage = await promisify(readFile)(packageJsonPath, "utf8").then(raw => JSON.parse(raw));

        const overrides = updateable
            .filter(p => p.safeRange)
            // To avoid downgrading dependencies we only define the override for the vulnerable range.
            .reduce((o, p) => ({ ...o, [`${p.name}@${p.vulnerableRange}`]: p.safeRange }), {});
        widgetPackage.overrides = { ...widgetPackage.overrides, ...overrides };

        await promisify(writeFile)(packageJsonPath, JSON.stringify(widgetPackage, null, 2), "utf8");
        console.log("Updating dependencies");
        await promisify(exec)("npm install --package-lock-only && npm install"); // --package-lock-only forces the dependency tree to be re-resolved. Then run npm install to update node_modules accordingly
    }

    reportOtherDirectVulnerabilities(report);
}

function reportOtherDirectVulnerabilities(report: NpmAudit.Report) {
    if (Object.values(report.vulnerabilities).some(p => p.isDirect && p.name != pluggableWidgetsTools)) {
        console.log(
            yellow("Other dependencies of the widget contain vulnerabilities. Run `npm audit` for more information.")
        );
    }
}

interface UpdateablePackage {
    name: NpmAudit.PackageName;
    vulnerableRange: string;
    safeRange?: string;
}

/**
 * Determines the next "safe" version for an npm package.
 *
 * Initially the safeRange was set to greater or equal to minimum safe version. However, this did not always work.
 * Some dependencies depending on a version range lower than the vulnerable range would still resolve to unsafe versions.
 * Using the ^ version range avoids this, as the version is specific enough for npm.
 */
async function findSafeVersion({ name, range }: NpmAudit.Dependency): Promise<UpdateablePackage> {
    const versions = await promisify(exec)(`npm show ${name} versions --json`).then(
        ({ stdout }) => JSON.parse(stdout) as string[]
    );

    const maxVulnerable = maxSatisfying(versions, range);
    const gtMaxVulnerable = ">" + maxVulnerable;
    const minNonVulnerable = minSatisfying(versions, gtMaxVulnerable);

    if (!minNonVulnerable) {
        return { name, vulnerableRange: range };
    }

    return { name, vulnerableRange: range, safeRange: "^" + minNonVulnerable };
}
