import React, { useOptimistic, useActionState } from "react"

export function Greeting() {
	const x = useOptimistic(() => 42)
	const y = useActionState(() => 43)
	console.log("Rendering Greeting component in editor preview", y, x)

	return <div>Hi {name}!</div>
}
