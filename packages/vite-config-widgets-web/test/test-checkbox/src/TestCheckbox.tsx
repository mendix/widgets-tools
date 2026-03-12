import { createElement, ReactElement } from "react";

export interface TestCheckboxProps {
    checked: boolean;
    label: string;
    onChange?: () => void;
}

export function TestCheckbox(props: TestCheckboxProps): ReactElement {
    return createElement(
        "div",
        { className: "test-checkbox-container" },
        createElement("label", null,
            createElement("input", {
                type: "checkbox",
                checked: props.checked,
                onChange: props.onChange
            }),
            createElement("span", null, props.label)
        )
    );
}
