import React, { use } from "react"
import { ThemeContext } from "theming"

export function Greeting() {
	const name = use(ThemeContext)

	return <div>Hi {name}!</div>
}
