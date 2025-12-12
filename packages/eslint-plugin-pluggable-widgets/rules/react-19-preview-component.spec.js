const { RuleTester } = require("eslint")
const react19PreviewComponent = require("./react-19-preview-component.js")

const ruleTester = new RuleTester({
	languageOptions: { ecmaVersion: 2022, parserOptions: { ecmaFeatures: { jsx: true } } },
})

ruleTester.run(
	"react-19-preview-component",
	react19PreviewComponent,
	{
		valid: [
			{
				code: `
import { useMemo, createElement } from "react"

export function Greeting(props) {
	const name = useMemo(() => props.name.toLowerCase(), [props.name])

	return <div>Hi {name}!</div>
}
			`},
			{
				code: `
import { useMemo, createElement } from "react"

const use = () => console.log("Being used!")

export function Greeting(props) {
	const name = useMemo(() => props.name.toLowerCase(), [props.name])

	return <div>Hi {name}!</div>
}
			`},

		],
		invalid: [
			{
				code: `
import { use, createElement } from "react"
import { ThemeContext } from "theming"

export function Greeting(props) {
	const name = use(ThemeContext)

	return <div>Hi {name}!</div>
}
			`,
				errors: 1
			}
		]
	}
)

console.log("All tests passed!")

