import { Version } from "../version";

export interface ReleasedVersionEntry {
    type: "normal";
    version: Version;
    date: Date;
    sections: LogSection[];
}

export interface UnreleasedVersionEntry {
    type: "unreleased";
    sections: LogSection[];
}

export interface NoteEntry {
    type: "note";
    title: string;
    text: string;
}

export type VersionEntry = ReleasedVersionEntry | UnreleasedVersionEntry | NoteEntry;

export type SubComponentEntry =
    | {
          version: Version;
          name: string;
          sections: LogSection[];
      }
    | {
          name: string;
          sections: LogSection[];
      };

export interface LogSection {
    type: "Fixed" | "Added" | "Changed" | "Removed";
    logs: string[];
}

export interface ChangelogFile {
    header: string;
    content: [UnreleasedVersionEntry, ...Array<ReleasedVersionEntry | NoteEntry>];
}
