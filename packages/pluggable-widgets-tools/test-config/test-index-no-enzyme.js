require("@testing-library/jest-dom");
const { TextEncoder, TextDecoder } = require("util");

Object.defineProperties(global, {
    TextEncoder: {
        value: TextEncoder
    },
    TextDecoder: {
        value: TextDecoder
    }
});
