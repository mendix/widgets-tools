export type Option<T> = T | undefined;

export function ensure<T>(input: T | undefined): T {
    if (isDefined(input)) {
        return input;
    }
    throw Error("Unexpected value of undefined");
}

export function isDefined<T>(input: T | undefined): input is T {
    return input !== undefined;
}
