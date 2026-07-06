require("@testing-library/jest-dom");
const { TextEncoder, TextDecoder } = require("util");

// `@swc/jest` can't inline mendix's ambient `const enum`s, so it emits a real
// `require("mendix")`. Mock the runtime values.
// Keep in sync with node_modules/mendix/index.d.ts.
jest.mock("mendix", () => ({
    ValueStatus: {
        Available: "available",
        Unavailable: "unavailable",
        Loading: "loading"
    },
    FormatterType: {
        Number: "number",
        DateTime: "datetime"
    }
}));

Object.defineProperties(global, {
    TextEncoder: {
        value: TextEncoder
    },
    TextDecoder: {
        value: TextDecoder
    }
});
