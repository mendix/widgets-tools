const { jsx } = require("react/jsx-runtime");
const { View } = require("react-native");

module.exports = {
    Icon: () => jsx(View, { testId: "icon" })
}
