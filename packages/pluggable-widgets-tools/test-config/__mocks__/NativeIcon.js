const { createElement } = require("react");
const { View } = require("react-native");

module.exports = {
    Icon: () => createElement(View, { testId: "icon" })
}
