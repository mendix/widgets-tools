const { TextEncoder, TextDecoder } = require("util");
const enableHooks = require("jest-react-hooks-shallow").default;

Object.defineProperties(global, {
    TextEncoder: {
        value: TextEncoder
    },
    TextDecoder: {
        value: TextDecoder
    }
});

enableHooks(jest);
global.setImmediate = global.setTimeout;

const origConsole = console.error;
const BLOCKED_ERROR_TAGS = [
    "prop on a DOM element",
    "is using incorrect casing",
    "Unknown event handler property",
    "for a non-boolean attribute",
    "start its name with an uppercase letter"
];

beforeEach(() => {
    console.error = e => {
        if (!BLOCKED_ERROR_TAGS.some(tag => e.includes(tag))) {
            console.warn(e);
        }
    };
});

afterEach(() => {
    console.error = origConsole;
});
