import { styleText, format } from "node:util";
import { SyntaxError } from "./changelog-parser/changelog.js";

export class UsageError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class ArgumentError extends UsageError {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(argument: string, received: any) {
        super(`Argument "${received}" is not a valid ${argument}`);
    }
}

export class ConfigurationError extends UsageError {
    constructor(message: string) {
        super(message);
    }
}

export class ChangelogError extends Error {
    file: string;
    constructor(file: string, error: Error) {
        super(format("%s while parsing changelog file %s", error.constructor.name, file), { cause: error });
        this.file = file;
    }

    toString() {
        if ("GITHUB_ACTIONS" in process.env) {
            if (this.cause instanceof SyntaxError) {
                return format(
                    "::error file=%s,line=%d,col=%d,endLine=%d,endColumn=%d,title=Changelog SyntaxError::%s",
                    this.file,
                    this.cause.location.start.line,
                    this.cause.location.start.column,
                    this.cause.location.end.line,
                    this.cause.location.end.column,
                    this.cause.format([])
                );
            } else {
                return format("::error file=%s,title=ChangelogError::%s", this.file, this.cause);
            }
        }

        const msg = "ChangelogError: %s:\n\t%s";
        if (this.cause instanceof SyntaxError) {
            return format(msg, this.message, this.cause.format([]));
        } else {
            return format(msg, this.message, this.cause);
        }
    }
}

export function ensureError(e: unknown) {
    if (e instanceof Error) {
        return e;
    }
    if (typeof e === "string") {
        return new Error(e);
    }
    return new Error(format("Unknown Error: %O", e));
}

export function handleError(e: unknown, usage: string) {
    if (e instanceof UsageError) {
        console.error(styleText("red", format("%s: %s", e.constructor.name, e.message)));
        console.error(usage);
    } else {
        console.error(styleText("red", format("%s", e)));
    }
}
