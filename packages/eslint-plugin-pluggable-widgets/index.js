const react19PreviewComponent = require("./rules/react-19-preview-component.js");

const plugin = {
	meta: { name: "@mendix/eslint-plugin-pluggable-widgets" },
	rules: {
		'no-react-19-editor-preview': react19PreviewComponent
	}
}

module.exports = plugin;
