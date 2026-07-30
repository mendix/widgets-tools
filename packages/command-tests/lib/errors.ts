export function ensureError(input: unknown): Error {
    if (input instanceof Error) {
        return input;
    }
    if (typeof input === "string") {
        return new Error(input);
    }
    return new Error(`Unknown Error: ${input}`);
}
