
export class WidgetValidationError extends Error {
    name = "Widget Validation Error"

    constructor(message: string) {
        super(message)
    }
}

/**
 * Asserts that the given input string only contains the characters specified by `legalCharacters`.
 * @param input The string under test
 * @param legalCharacters The characters that the input string may contain. Follows character class notation from regex (inside the [])
 * @param message The message that is included in the error. Specify where the input is used and can be corrected.
 * @throws WidgetValidationError If the input contains characters not allowed by legalCharacters
 */
export function throwOnIllegalChars(input: string, legalCharacters: string, message: string): void {
    const pattern = new RegExp(`([^${legalCharacters}])`, "g")
    const illegalChars = input.match(pattern);

    if (illegalChars === null) {
        return
    }

    const formatted = illegalChars
        .reduce((unique, c) => unique.includes(c) ? unique : [...unique, c], [] as string[])
        .map(c => `"${c}"`)
        .join(", ");

    throw new WidgetValidationError(`${message} contains illegal characters ${formatted}. Allowed characters are [${legalCharacters}].`)
}

/**
 * Asserts that the given input string matches the given pattern.
 * @param input The string under test
 * @param pattern The pattern the input must match
 * @param message The message that is included in the error. Specify where the input is used and can be corrected.
 * @throws WidgetValidationError If the input contains characters not allowed by legalCharacters
 */
export function throwOnNoMatch(input: string, pattern: RegExp, message: string) {
    if (pattern.test(input)) {
        return
    }

    throw new WidgetValidationError(`${message} does not match the pattern ${pattern}.`)
}

