// Runtime mock for the types-only `mendix` package, whose real entry throws
// ("This package should not be used in the runtime"). `@swc/jest` can't inline
// the ambient `const enum ValueStatus`, so it emits a live `require("mendix")`
// that needs this safe module exporting the enum values widget code uses.
//
// Keep values in sync with node_modules/mendix/index.d.ts.
module.exports = {
    ValueStatus: {
        Available: "available",
        Unavailable: "unavailable",
        Loading: "loading"
    },
    FormatterType: {
        Number: "number",
        DateTime: "datetime"
    }
};
