![Unit tests](https://github.com/mendix/widgets-tools/actions/workflows/UnitTests.yml/badge.svg?branch=master)
![PWT Commands Tests](https://github.com/mendix/widgets-tools/actions/workflows/TestPWTCommands.yml/badge.svg?branch=master)
![Publisn NPM](https://github.com/mendix/widgets-tools/actions/workflows/PublishNpm.yml/badge.svg?branch=master)

# Widgets tools

Monorepo for the Mendix tools for generating and build Mendix Pluggable Widgets.

[Learn about Pluggable Widgets](https://docs.mendix.com/howto/extensibility/pluggable-widgets/)

## Pluggable widgets tools

A toolset to build, test, format, run, release and lint Mendix Pluggable Widgets.

[Source](./packages/pluggable-widgets-tools/) | [NPM Package](https://www.npmjs.com/package/@mendix/pluggable-widgets-tools)

## Generator widget

Scaffolding tool to let you quickly create a Mendix Pluggable Widget.

#### Note

-   If you are running the generator through multiple operating systems (e.g. running a virtualized OS with Parallels on MacOS or any other virtualization software), make sure you have the right privileges and use the same OS for generation and file manipulation.

-   If you want to test locally your changes to the Generator Widget, simply link the package running `npm link` inside the `packages/generator-widget/` folder and then you will be able to run `yo widget SomeWidgetName`

[Source](./packages/generator-widget/) | [NPM Package](https://www.npmjs.com/package/@mendix/generator-widget)

## Contributing

See [CONTRIBUTING.md](https://github.com/mendix/widgets-tools/blob/master/CONTRIBUTING.md).

## Raising problems/issues

-   We encourage everyone to open a Support ticket on [Mendix Support](https://support.mendix.com) in case of problems with Generator Widget or Pluggable Widgets Tools
