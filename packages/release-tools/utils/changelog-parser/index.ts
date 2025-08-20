import { readFileSync, writeFileSync } from "fs";
import { Version } from "../version";
import { parse as parseChangelogFile } from "./changelog";
import { LogSection, ReleasedVersionEntry, UnreleasedVersionEntry, VersionEntry, ChangelogFile } from "./types";

function formatHeader(header: string): string[] {
    return [
        "# Changelog",
        header,
        "The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)."
    ];
}

function formatVersionEntry(v: VersionEntry): string[] {
    if (v.type === "note") {
        return [`## ${v.title}`, v.text];
    }

    return [
        v.type === "normal" ? `## [${v.version.format()}] - ${formatDate(v.date)}` : "## [Unreleased]",
        ...v.sections.flatMap(formatSectionEntry(3))
    ];
}

const formatSectionEntry =
    (depth = 3) =>
    (s: LogSection): string[] => {
        return [`${"#".repeat(depth)} ${s.type}`, ...s.logs.map(formatChangeEntry)];
    };

function formatChangeEntry(c: string): string {
    return `-   ${c}`;
}

function formatDate(date: Date): string {
    return `${date?.getFullYear()}-${(date?.getMonth() + 1).toString().padStart(2, "0")}-${date
        ?.getDate()
        .toString()
        .padStart(2, "0")}`;
}

export class ChangelogFileWrapper {
    changelog: ChangelogFile;

    private constructor(changelog: ChangelogFile, public changelogPath: string) {
        this.changelog = Object.freeze(changelog);
    }

    save(): void {
        const fileContent =
            [...formatHeader(this.changelog.header), ...this.changelog.content.flatMap(formatVersionEntry)].join(
                "\n\n"
            ) + "\n";

        writeFileSync(this.changelogPath, fileContent);
    }

    hasVersion(version: Version): boolean {
        return this.changelog.content.some(c => "version" in c && c.version.equals(version));
    }

    hasUnreleasedLogs(): boolean {
        return this.changelog.content[0].sections.length !== 0;
    }

    moveUnreleasedToVersion(newVersion: Version): ChangelogFileWrapper {
        const unreleased = this.changelog.content[0];

        if (unreleased.sections.length === 0) {
            throw new Error("Unreleased section is empty");
        }

        const emptyUnreleased: UnreleasedVersionEntry = {
            type: "unreleased",
            sections: []
        };

        const newRelease: ReleasedVersionEntry = {
            type: "normal",
            version: newVersion,
            date: new Date(),
            sections: unreleased.sections
        };

        return new ChangelogFileWrapper(
            {
                header: this.changelog.header,
                content: [emptyUnreleased, newRelease, ...(this.changelog.content.slice(1) as ReleasedVersionEntry[])]
            },
            this.changelogPath
        );
    }

    static fromFile(filePath: string): ChangelogFileWrapper {
        return new ChangelogFileWrapper(parseChangelogFile(readFileSync(filePath).toString(), { Version }), filePath);
    }
}
