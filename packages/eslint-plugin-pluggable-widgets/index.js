import react19PreviewComponent from "./rules/react-19-preview-component.js"

const plugin = {
	meta: { name: "@mendix/eslint-plugin-pluggable-widgets" },
	rules: {
		'no-react-19-editor-preview': react19PreviewComponent
	}
}

export default plugin;
