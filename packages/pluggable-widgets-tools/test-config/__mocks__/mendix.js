// @ts-check
// Runtime mock for the types-only `mendix` package (its real entry throws).
// Stays plain JS because it ships inside the consumer's node_modules, where
// jest won't transform TypeScript. The JSDoc `@type` annotations check the
// values against `mendix`'s types (repo-only, via test-config/tsconfig.json)
// and are erased at runtime.

/** @typedef {typeof import("mendix")} MendixModule */

/**
 * Map an enum's type to `{ [Member]: itsStringValue }`.
 * @template E
 * @typedef {{ [K in keyof E]: `${Extract<E[K], string>}` }} EnumMock
 */

module.exports = {
    /** @type {EnumMock<MendixModule["ValueStatus"]>} */
    ValueStatus: {
        Available: "available",
        Unavailable: "unavailable",
        Loading: "loading"
    },
    /** @type {EnumMock<MendixModule["FormatterType"]>} */
    FormatterType: {
        Number: "number",
        DateTime: "datetime"
    }
};
