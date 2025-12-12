
# ESLint Plugin Pluggable Widgets

ESLint plugin for custom rules when developing pluggable widgets.

## TODO

- [ ] Implement as usable plugin.
- [ ] Extend testing to run all test files
- [ ] Add rule-specific documentation

### React 19 in Preview Components

- [x] Implement rule for detecting React 19 api usage in `editorPreview` component.
- [ ] Implement rule for detecting React 19 api usage by components imported by `editorPreview` component.  
    We can do this by tracking imports across files visited in the AST
