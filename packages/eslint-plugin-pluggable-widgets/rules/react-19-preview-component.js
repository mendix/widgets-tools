const UNSUPPORTED_IMPORTS = new Set([
	"use",
	"useActionState",
	"useFormState",
	"useOptimistic",
])

const AST_NODE_TYPES = {
	Identifier: "Identifier",
	ImportSpecifier: "ImportSpecifier"
}

console.log("Reached the rule!")

// TODO: Initialize the imports graph

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

		if (context.getFilename().match(/\.editorPreview\.(jsx|tsx)$/) === null) {
			return {
				// TODO: Register the imports between files
			}
		}

		return {
			Program() {
				reactImports = {}
			},
			ImportDeclaration(node) {
				// TODO: Register the imports between files
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
					// TODO: Register the nodes and unsupported symbol to a file
					context.report({ node: node, messageId: 'UsesUse' })
				}
			}
		}
		// TODO: Somehow report each use of unsupported symbols for files imported by editorPreview
	},
}

module.exports = rule;
