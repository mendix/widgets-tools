import { ChangelogFile } from "./types";

declare interface Location {
    line: number;
    column: number;
    offset: number;
}

declare interface LocationRange {
    start: Location;
    end: Location;
}

export declare class SyntaxError {
    line: number;
    column: number;
    offset: number;
    location: LocationRange;
    expected: unknown[];
    found: unknown;
    name: string;
    message: string;
}

export declare function parse(fileContent: string, options: object): ChangelogFile;
