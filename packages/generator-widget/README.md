# Mendix Pluggable Widgets Generator

![npm version](https://badge.fury.io/js/%40mendix%2Fgenerator-widget.svg)
![Mendix 8](https://img.shields.io/badge/mendix-8.0.0-brightgreen.svg)
![Build Status](https://travis-ci.org/mendix/widgets-tools.svg?branch=master)
![npm](https://img.shields.io/npm/dm/@mendix/generator-widget)
![GitHub release](https://img.shields.io/github/release/mendix/widgets-tools)
![GitHub issues](https://img.shields.io/github/issues/mendix/widgets-tools)

## About

The Mendix Pluggable Widget Generator is a scaffolding tool to let you quickly create a [Mendix Pluggable Widget](https://docs.mendix.com/howto/extensibility/pluggable-widgets).

## Installation

1. Install [node.js](https://nodejs.org/) (version >= 16).

## Scaffold a widget project

1. Generate your new project inside an empty folder:

    ```bash
    npx @mendix/generator-widget
    ```

    or automatically create the folder using:

    ```bash
    npx @mendix/generator-widget MyWidgetName
    ```

    Note that `MyWidgetName` can consist of space characters as well.

1. Provide the following information about your widget project (press <Enter> if you want to skip and use the default values):

    - Widget name
    - Description
    - Organization
    - Copyright
    - License
    - Version
    - Author
    - Mendix project path
    - Programming language
    - Platform
    - Template
    - Add unit tests
    - Add end-to-end tests

### Template

#### Full boilerplate

The full widget boilerplate is a fully developed and tested Mendix React widget that shows a value as a badge or a color label (just available for web/responsive platforms).
It has the following features:

-   Display as a badge or a color label
-   Attach actions to the onClick event
-   Set static data text when the dynamic data is not specified

#### Empty widget

The empty template is a Mendix React hello world widget recommended for more experienced developers.

### Add unit tests

If `Yes` is selected, unit tests are included to ensure individual units of the component are tested to determine whether they are fit for use. The default value is `No`.

### Add end-to-end tests

If `Yes` is selected, end-to-end tests are included to ensure that the integrated components of an application function as expected. The default value is `No`.

Note: Both `Unit` and `End-to-end` tests apply only to the Full Boilerplate. `End-to-end` is exclusive for web and PWA apps.

The tool will then create copied files, and run `npm install` to install development dependencies.

## Using the task runner

The widget generator will include the necessary files and tasks to your package.json for running the tasks over the [Pluggable Widgets Tools](https://github.com/mendix/widgets-tools/tree/master/packages/tools/pluggable-widgets-tools).

If necessary you can run the tasks using the commands:

```bash
npm start
```

```bash
npm run build
```

```bash
npm run release
```

## Note

-   To build and watch for source code changes while developing, run the Mendix project located at the specified `Mendix project path` and run:

    ```bash
    npm start
    ```

## Issues

Issues can be reported on [Github](https://github.com/mendix/widgets-tools/issues).
