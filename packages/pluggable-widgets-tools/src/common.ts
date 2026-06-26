export function ensure<T>(arg?: T, label: string = "argument"): T {
    if (arg === null || arg === undefined) {
        throw new Error(`Did not expect ${label} to be ${arg}`);
    }
    return arg;
}

export function partition<T, A extends T, B extends Exclude<T, A>>(
    input: Array<T>,
    predicate: (x: T) => x is A
): [A[], B[]] {
    return [input.filter(predicate), input.filter((x): x is B => !predicate(x))] as const;
}
