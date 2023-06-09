require("@testing-library/jest-dom");
const { TextEncoder, TextDecoder } = require("util");
const { configure: configureEnzyme } = require("enzyme");
const Adapter = require("@cfaester/enzyme-adapter-react-18").default;
const enableHooks = require("jest-react-hooks-shallow").default;

Object.defineProperties(global, {
    TextEncoder: {
        value: TextEncoder
    },
    TextDecoder: {
        value: TextDecoder
    }
});

configureEnzyme({ adapter: new Adapter() });
enableHooks(jest);
global.setImmediate = global.setTimeout;
