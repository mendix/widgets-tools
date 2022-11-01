import { join } from "path";
import {
    addRemoteWithAuthentication,
    execShellCommand,
    getPackageInfo,
    gh,
    PackageInfo,
    ChangelogFileWrapper
} from "./utils";

main().catch(e => {
    console.error(e);
    process.exit(-1);
});

async function main(): Promise<void> {
    const packages = new Map([
        [
            "pwt",
            {
                name: "pluggable-widgets-tools",
                fullName: "Pluggable Widgets Tools"
            }
        ],
        [
            "gw",
            {
                name: "generator-widget",
                fullName: "Pluggable Widgets Generator"
            }
        ]
    ]);
    const arg = process.argv[2];
    const mendixPackage = packages.get(arg);
    if (!mendixPackage) throw new Error(`Argument "${arg}" is not a valid package name`);

    const pwtPath = join(process.cwd(), `packages/${mendixPackage.name}`);

    // 1. Get release info
    console.log(`Getting the release information for ${mendixPackage.name}...`);
    console.log(`directory:`, pwtPath);

    const packageInfo = await getPackageInfo(pwtPath);
    packageInfo.packageName = mendixPackage.name;
    packageInfo.packageFullName = mendixPackage.fullName;
    const releaseTag = `${packageInfo.packageName}-v${packageInfo.version.format()}`;
    const changelog = ChangelogFileWrapper.fromFile(`${pwtPath}/CHANGELOG.md`);

    // 2. Check prerequisites
    // 2.1. Check if current version is already in CHANGELOG
    if (changelog.hasVersion(packageInfo.version)) {
        throw new Error(`Version ${packageInfo.version.format()} already exists in CHANGELOG.md file.`);
    }

    // 2.2. Check if there is something to release (entries under "Unreleased" section)
    if (!changelog.hasUnreleasedLogs()) {
        throw new Error(
            `No unreleased changes found in the CHANGELOG.md for ${
                packageInfo.packageName
            } ${packageInfo.version.format()}.`
        );
    }

    // 2.3. Check there is no release of that version on GitHub
    const releaseId = await gh.getReleaseIdByReleaseTag(releaseTag);
    if (releaseId) {
        throw new Error(`There is already a release for tag '${releaseTag}'.`);
    }

    // 4. Do release
    console.log(`Preparing ${packageInfo.packageName}...`);

    const remoteName = `origin-${packageInfo.packageName}-v${packageInfo.version.format()}-${Date.now()}`;

    // 4.1 Set remote repo as origin
    await addRemoteWithAuthentication(packageInfo.repositoryUrl, remoteName);

    // 4.2 Update CHANGELOG.md and create PR
    console.log("Creating PR with updated CHANGELOG.md file...");
    await updateChangelogsAndCreatePR(packageInfo, changelog, releaseTag, remoteName);

    // 4.3 Create release
    console.log("Creating Github release...");
    await gh.createGithubReleaseFrom({
        title: `${packageInfo.packageFullName} v${packageInfo.version.format()}`,
        notes: changelog.changelog.content[0].sections
            .map(s => `## ${s.type}\n\n${s.logs.map(l => `- ${l}`).join("\n\n")}`)
            .join("\n\n"),
        tag: releaseTag,
        target: "HEAD",
        isDraft: true,
        repo: packageInfo.repositoryUrl
    });

    console.log("Done.");
}

async function updateChangelogsAndCreatePR(
    packageInfo: PackageInfo,
    changelog: ChangelogFileWrapper,
    releaseTag: string,
    remoteName: string
): Promise<void> {
    const releaseBranchName = `${releaseTag}-update-changelog`;

    console.log(`Creating branch '${releaseBranchName}'...`);
    await execShellCommand(`git checkout -b ${releaseBranchName}`);

    console.log("Updating CHANGELOG.md...");
    const updatedChangelog = changelog.moveUnreleasedToVersion(packageInfo.version);
    updatedChangelog.save();

    console.log(`Committing CHANGELOG.md to '${releaseBranchName}' and pushing to remote...`);
    await execShellCommand([
        `git add ${changelog.changelogPath}`,
        `git commit -m "Update changelog for ${packageInfo.packageName}"`,
        `git push ${remoteName} ${releaseBranchName}`
    ]);

    console.log(`Creating pull request for '${releaseBranchName}'`);
    await gh.createGithubPRFrom({
        title: `${packageInfo.packageFullName} v${packageInfo.version.format()}: Update changelog`,
        body: "This is an automated PR that merges changelog update to master.",
        base: "master",
        head: releaseBranchName,
        repo: packageInfo.repositoryUrl
    });

    console.log("Created PR for changelog updates.");
}
