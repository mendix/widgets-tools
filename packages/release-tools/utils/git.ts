import { execShellCommand } from "./shell.ts";

function getGHRepoAuthUrl(repoUrl: string): string {
    const url = new URL(repoUrl);
    const { GH_USERNAME, GH_PAT } = process.env;
    if (!GH_USERNAME || !GH_PAT) {
        throw new Error("Required GH_USERNAME and GH_PAT env vars are not set.");
    }

    url.username = GH_USERNAME;
    url.password = GH_PAT;

    return url.toString();
}

async function setLocalGitUserInfo(workingDirectory?: string): Promise<void> {
    const { GH_NAME, GH_EMAIL } = process.env;
    if (!GH_NAME || !GH_EMAIL) {
        throw new Error("Required GH_NAME and GH_EMAIL env vars are not set.");
    }
    await execShellCommand(`git config user.name "${GH_NAME}"`, workingDirectory);
    await execShellCommand(`git config user.email "${GH_EMAIL}"`, workingDirectory);
}

export async function addRemoteWithAuthentication(repoUrl: string, remoteName: string): Promise<void> {
    await setLocalGitUserInfo();

    await execShellCommand(`git remote add "${remoteName}" "${getGHRepoAuthUrl(repoUrl)}"`);
}
