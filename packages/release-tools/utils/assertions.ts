export function ensure<T>(input: T | undefined | null, message?: string): T {
    if (input === undefined || input === null) {
        throw Error(message ?? `Expected a value but received ${input}`);
    }
    return input;
}
