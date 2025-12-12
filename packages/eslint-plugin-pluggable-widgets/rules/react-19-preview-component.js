const UNSUPPORTED_IMPORTS = new Set(["use", "useState"])

const AST_NODE_TYPES = {
	Identifier: "Identifier",
	ImportSpecifier: "ImportSpecifier"
}

console.log("Reached the rule!")

const rule = {
	name: "no-react-19-editor-preview",
	meta: {
		type: "problem",
		docs: {
			description: "Widget Preview Components can only make use of React features supported in React 18."
		},
		messages: {
			UsesUse: "The use() hook from React 19 cannot be used in Widget Preview Components."
		},
		schema: [],
	},
	defaultOptions: [],
	create(context) {
		let reactImports = {}

		context.getFilename().match(/\.Preview\.(jsx|tsx)$/)

		return {
			Program() {
				reactImports = {}
			},
			ImportDeclaration(node) {
				if (node.source.value === "react") {
					reactImports = node.specifiers.reduce((imports, specifier) => {
						if (specifier.type === AST_NODE_TYPES.ImportSpecifier) {
							imports[specifier.local.name] = specifier.imported.name
						}
						return imports
					}, reactImports)
				}
			},
			CallExpression(node) {
				if (node.callee.type === AST_NODE_TYPES.Identifier && node.callee.name in reactImports && UNSUPPORTED_IMPORTS.has(reactImports[node.callee.name])) {
					context.report({ node, messageId: 'UsesUse' })
				}
			}
		}
	},
}

export default rule;
