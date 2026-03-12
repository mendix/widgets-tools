import { createElement as e } from "react";
function t(n) {
  return e(
    "div",
    { className: "test-checkbox-container" },
    e(
      "label",
      null,
      e("input", {
        type: "checkbox",
        checked: n.checked,
        onChange: n.onChange
      }),
      e("span", null, n.label)
    )
  );
}
export {
  t as TestCheckbox
};
