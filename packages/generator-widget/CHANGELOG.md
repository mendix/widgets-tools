# Changelog

All notable changes to this tool will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [10.15.1] - 2025-05-19

### Changed

-   We improved the startup time when using the generator with `npx`.

### Fixed

-   We fixed the error message when attempting to generate a widget in a non-empty directory. (Issue #123)

### Security

-   We updated dependencies to recent security patches.

## [10.15.0] - 2024-09-24

### Changed

-   We updated dependencies with non-breaking security patches.

## [10.7.3] - 2024-07-10

### Changed

-   We updated the default overrides (and resolutions) for generated widgets to ensure consistent React types with `@mendix/pluggable-widgets-tools`. This fixes errors like "_Type Element is not assignable to type ReactElement_".

## [10.7.2] - 2024-03-07

### Changed

-   We updated react-native dependency for the Yeoman generator from 0.70.7 to 0.72.7.

## [10.7.1] - 2024-02-15

### Changed

-   We updated pluggable-widgets-tools dependency from ^10.5.0 to ^10.7.1.

## [10.5.1] - 2024-01-31

### Changed

-   We introduced an easier way to scaffold a pluggable widget using an npx command without the need to install Yeoman Generator and the @mendix/generator-widget package.

## [10.5.0] - 2023-12-01

### Changed

-   We updated the templates package_web.json and package_native.json to use @mendix/pluggable-widgets-tools version 10.5.0.

## [10.0.0] - 2023-06-27

### Changed

-   We updated pluggable-widgets-tools dependency from ^9.24.0 to ^10.0.0.

## [9.24.2] - 2023-06-09

### Fixed

-   We fixed a problem preventing typescript templates with e2e tests from being generated.

## [9.24.1] - 2023-04-03

### Fixed

-   We fixed the broken package.json templates for native and web when generating widgets without unit/e2e tests

## [9.24.0] - 2023-03-31

### Changed

-   We've updated our templates to support the new version of Pluggable Widgets Tools containing new React and React Native versions. This is necessary due to breaking changes introduced in Studio Pro 9.24.0.

-   We've updated our templates to remove `@types/react`, `@types/react-dom` and `@types/react-native` from the generated widget's package.json since those dependencies will be part of the Pluggable Widgets Tools 9.24.

## [9.20.0] - 2022-12-12

### Changed

-   We have updated the signature of the structure mode preview function to include the Studio Pro version, which is passed in Mendix 9.20 and above (and in 9.18.3+, but not 9.19).

-   We have added support to the `DropZoneProps` type for the ability to make dropzone headers in structure mode previews optional, which was added in Mendix 9.20.

## [9.18.0] - 2022-10-27

### Changed

-   We updated package.json web template to use Cypress directly without the pluggable-widgets-tools scripts.

-   We updated pluggable-widgets-tools dependency from ^9.0.0 to ^9.18.0

## [9.3.0] - 2022-09-22

### Changed

-   We updated templates to use Cypress instead of Wdio for e2e testing purposes.

-   We updated templates to provide the latest available functionalities.

## [9.2.3] - 2022-07-04

### Changed

-   We updated required Node.js version to the current LTS version.

## [9.2.1] - 2022-02-25

### Fixed

-   We fixed an issue with generator producing invalid package.json file when user provides answers that has double quotes. (Ticket 142686)

## [9.2.0] - 2022-01-07

### Added

-   We added `@prettier/plugin-xml` plugin to fix xml code format and check for xml errors.

-   You can now choose between generating class or function components.

## [9.1.0] - 2022-01-04

### Added

-   We've added missing functions in editorPreview files.

-   We've added editorConfig file for widgets.

### Changed

-   We've updated the editorPreview files for web projects with correct properties.

-   We've updated the version of yeoman-generator to 5.4.2.

-   We've updated the configurations for tsconfig in web widgets.

-   We've updated the npm tasks and template classes for web widgets.

## [9.0.2] - 2021-05-20

### Removed

-   Links to unsupported Github issues page for bug reporting.

## [9.0.1] - 2021-04-26

### Changed

-   Explain to users in the README of a generated widget project how to install dependencies with NPM v7.x.x.

### Fixed

-   Fix failing `npm install` executions when scaffolding a widget project with the widget generator with NPM v7.x.x.

-   Set required Node.js version to v12 or higher for the generator itself and the generated widget projects, since Node.js v10 is EOL at the end of April 2021 and pluggable widgets tools requires Node.js v12.
