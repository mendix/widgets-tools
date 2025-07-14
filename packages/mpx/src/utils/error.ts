import { prettifyError, ZodError } from "zod";

class BuildError extends Error {
    constructor(message: string) {
        super(`Build failed with error:\n\n${message}`);
        this.name = "BuildError";
    }
}

export function parsePackageError(error: unknown) {
    return new BuildError(`Failed to parse package.json:\n${formatMessage(error)}`);
}

export function formatMessage(error: unknown): string {
    if (error instanceof ZodError) {
        return prettifyError(error);
    } else if (error instanceof Error) {
        return error.message;
    } else if (typeof error === "string") {
        return error;
    } else {
        return String(error);
    }
}
