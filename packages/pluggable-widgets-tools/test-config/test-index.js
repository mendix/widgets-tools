const { configure: configureEnzyme } = require("enzyme");
const Adapter = require("@cfaester/enzyme-adapter-react-18").default;
const enableHooks = require("jest-react-hooks-shallow").default;

configureEnzyme({ adapter: new Adapter() });
enableHooks(jest);
global.setImmediate = global.setTimeout;
