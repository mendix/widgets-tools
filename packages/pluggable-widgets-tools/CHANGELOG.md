# Changelog

All notable changes to this tool will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [11.3.0] - 2025-11-10

### Changed

-   We added @d11/react-native-fast-image as an external native dependency in rollup config.

## [10.24.0] - 2025-09-24

### Changed

-   We migrated to pnpm as our package manager. Users of the widgets tools should be able to continue using their package manager of choice.

-   We updated React Native to version 0.77.3 to align with the Native Widgets project requirements.

-   We updated Jest configuration for React Native testing to use the recommended preset and removed Enzyme support for improved compatibility and performance.

## [10.21.2] - 2025-07-02

### Changed

-   We fixed an issue with unit tests failing when files contain modern JavaScript features.

## [10.21.1] - 2025-06-13

### Added

-   We added enzyme-free unit test command in scripts.

## [10.21.0] - 2025-03-27

### Added

-   We added support for action variables, introduced in Mendix 10.21.

### Changed

-   We updated the Mendix package to 10.21.64362.

## [10.18.2] - 2025-03-21

### Fixed

-   We fixed an issue with loading custom rollup configs.

## [10.18.1] - 2025-03-11

### Fixed

-   We fixed an issue with "release" command failing in some cases.

### Changed

-   We updated "ts-node" package to version 10.

## [10.18.0] - 2024-12-20

### Added

-   We added the translate function to the preview arguments. This can be used to translate texts show in the widget preview.

### Changed

-   We upgraded rollup to version 3. Custom rollup.config.js files [likely require changes](./docs/rollup3-guide.md).

-   The renderMode property in the preview arguments is no longer considered optional.

-   We updated the Mendix package to 10.18.54340.

## [10.16.0] - 2024-10-31

### Added

-   We added the property type AssociationMetaData which exposes useful metadata for filtering and sorting datasources.

### Changed

-   We updated the Mendix package to 10.16.49747.

## [10.15.0] - 2024-09-24

### Added

-   We added the property type AttributeMetaData which exposes useful metadata for filtering and sorting datasources.

### Changed

-   We updated the Mendix package to 10.15.46408.

-   We updated dependencies with non-breaking security patches.

## [10.12.1] - 2024-07-10

### Added

-   We added the renderMode parameter to the preview arguments. This flag will give developers the ability to customize the preview for different render modes namely x-ray, structure and design.

### Changed

-   We fixed an issue regarding native navigation support.

## [10.12.0] - 2024-06-25

### Changed

-   We updated the Mendix package to version 10.12.38909.

### Fixed

-   We fixed an issue where the rollup process would sometimes hang and prevent the widget build/release script from completing.

## [10.7.2] - 2024-03-06

### Fixed

-   We fixed an issue where the rollup process would sometimes hang and prevent the widget build/release script from completing.

### Changed

-   We moved Pluggable Widgets Tools dependencies marked as external in rollup configuration files to devDependencies in the package.json.

-   We synced the version of @types/react package.

-   We synced the versions of resolution and override packages.

### Added

-   We added a new configuration file named jest.enzyme-free.config.js that doesn't include enzyme as a dependency.

-   We improved the widget migration script to exclude web dependencies for native widgets and vice versa.

## [10.7.1] - 2024-02-15

### Fixed

-   We fixed an issue where rollup warnings about `use client` and `use server` were causing bundling failures.

## [10.7.0] - 2024-01-31

### Changed

-   We updated the Mendix package to version 10.7.26214.

## [10.5.1] - 2024-01-19

### Fixed

-   We fixed an issue where migration caused a misalignment between versions for react, react-dom, react-native packages and their corresponding @types packages.

## [10.5.0] - 2023-12-01

### Changed

-   We updated the Mendix package to version 10.5.21627.

## [10.0.1] - 2023-08-24

### Fixed

-   We fixed a bug in rollup-plugin-assets causing assets url on windows to not have the correct path separator (Ticket 194099).

### Changed

-   We removed `watch` option from base config for typescript

## [10.0.0] - 2023-06-27

### Changed

-   We updated the Mendix package to version 10.0.9976.

### Removed

-   The ability to call a [linked property value](https://docs.mendix.com/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis-list-values/#linked-values) directly as a function, which was deprecated in Mendix 9.0, has been removed from the widgets API.

## [9.24.1] - 2023-06-09

### Fixed

-   We fixed few issues with Jest while executing unit tests

-   We fixed a few issues caused by missing dependencies on package.json

-   We fixed a jest setup issue causing enzyme.render not to work properly

## [9.24.0] - 2023-03-31

### Added

-   We added support to the typings generator for the data source caption (`{caption: string}`), introduced in version 9.24.0. This feature will give widget developers the ability to display the same caption for a data source, that Mendix uses in the Page Explorer, within a widget preview.

-   We've added an option to automatically migrate known libraries to versions compatible with Studio Pro 9.24

-   We added `@types/react`, `@types/react-dom` and `@types/react-native` as direct dependencies of the Pluggable Widgets Tools

### Changed

-   We updated the Mendix package to version 9.24.2965.

-   We bumped the pinned version of TypeScript to 4.9.5.

-   We updated the typings generator for icon properties to support icon collections, introduced in Mendix 9.24.

### Fixed

-   We fixed the output of the typings generator for `action` properties that are specified as the `onChange` action of an `association` property. In this case, the `action` property is not exported as a separate property to the widget, but the typings suggested otherwise.

### Removed

-   We removed the dependency for react-hot-loader as it's not being used since Pluggable Widgets Tools v9.0.0.

### Breaking changes

-   Icon properties now use `undefined` instead of `null` when no icon is selected. This change was done for compatibility with the `Icon` component in the pluggable widgets API.

-   We've updated our library versions (React and React Native), please be aware this might break your widgets. New libraries versions: React: 18.0.2, React-Native: 0.70.7. This is necessary due to breaking changes introduced in Studio Pro 9.24.0.

## [9.23.2] - 2023-03-07

### Fixed

-   We fixed an issue with jest configuration which was causing `pluggable-widgets-tools test:unit`, `pluggable-widgets-tools test:unit:web` and `pluggable-widgets-tools test:unit:native` to fail incorrectly.

## [9.23.1] - 2023-03-03

### Fixed

-   We fixed an issue that prevented pluggable-widgets-tools commands to execute on 9.23.0.

## [9.23.0] - 2023-03-01

### Changed

-   We updated the Mendix package to version 9.23.621.

## [9.20.0] - 2022-12-12

### Changed

-   We updated the @author in the typings generator from `Mendix UI Content Team` to `Mendix Widgets Framework Team`.

-   We updated babel-jest configuration to prevent warnings during unit test execution.

### Added

-   We added support to the typings generator for the `assignableTo` return type of an [expression property](https://docs.mendix.com/apidocs-mxsdk/apidocs/pluggable-widgets-property-types/#expression), introduced in Mendix 9.20. This feature allows the expected return type of the expression to be derived from an attribute property.

## [9.18.0] - 2022-10-27

### Removed

-   We removed `cypress` dependencies from the pluggable-widgets-tools and the script `test:e2e`. In case if you want to continue using Cypress, please install the dependencies manually.

### Deprecated

-   We've deprecated the `className` preview property. From now on, you have to use `class` property instead.

## [9.17.0] - 2022-09-02

### Added

-   We added support for association properties linked to a data source, introduced in Mendix 9.17.

### Breaking changes

-   We removed `webdriverio` from our dependencies as we're using Cypress for e2e testing purposes. In case if you want to continue using WebDriverIO, please install the dependencies manually.

## [9.13.4] - 2022-08-26

### Changed

-   We updated `cypress` to version 10.

### Fixed

-   We fixed an issue which caused CSS URL transforms to include paths with backslashes when running on Windows.

## [9.13.3] - 2022-08-15

### Added

-   We added set of helpers for conditional visibility of properties.

## [9.13.2] - 2022-06-29

### Changed

-   We updated required Node.js version to the current LTS version.

-   Update `rollup` and `@rollup/plugin-commonjs`

## [9.13.1] - 2022-05-23

### Fixed

-   We fixed an issue with some packages were wrongly assumed to be externally available.

## [9.13.0] - 2022-05-04

### Added

-   We added support for the new association property introduced in Mendix 9.13.

-   To meet the requirements of the FedRAMP regulation, we added a feature to generate `dependencies.txt` and `dependencies.json` files in the release phase of a widget. `dependencies.txt` file contains the license texts of all (transitive) dependencies and the `dependencies.json` file contains all (transitive) dependencies and their versions for automated scanning purposes.

-   We added a new feature to copy the `LICENSE` file if it exists in the widget source folder.

### Changed

-   We updated the Mendix package to version 9.13.43286.

### Fixed

-   We fixed the way assets are handled inside widgets to comply with strict Content-Security-Policy.

### Changed

-   We increased the max SVG file size limit to 200 kB to accommodate SVGs of a bigger size used in structure preview mode for the native release build tool.

## [9.11.0] - 2022-02-25

### Added

-   We added compatibility with node 15+ and npm 7+.

-   We added resolutions for `react`, `react-dom` and `react-native` in order to be compatible with node 15+ and npm 7+.

### Changed

-   We updated version of `@wdio` and `react-native` libraries.

-   We changed `eslint-plugin-react` to version `7.28.0` in order to fix this [issue](https://github.com/yannickcr/eslint-plugin-react/issues/3215).

### Removed

-   We removed `@wdio/sync` from our dependency.

### Breaking changes

-   WebDriverIO has deprecated its sync version while using node 16. E2e tests needs to be migrated to [async/await](https://webdriver.io/docs/sync-vs-async/) when using node 16 or manually add the dependency if not.

## [9.10.0] - 2022-02-02

### Changed

-   We updated mendix library to 9.10.36429

### Fixed

-   We bumped the version of rollup to 2.66.1 to fix a problem introduced in v2.67.0 causing builds to fail on Windows machines.

## [9.9.3] - 2022-01-10

### Changed

-   We changed usage of `colors` to `ansi-colors`.

## [9.9.2] - 2022-01-10

### Fixed

-   We fixed `colors` dependency version to 1.4.0.

## [9.9.1] - 2022-01-07

### Added

-   We added `@prettier/plugin-xml` plugin to fix xml code format and check for xml errors.

## [9.9.0] - 2022-01-04

### Fixed

-   We fixed the typing generation for actions that are referenced by the `onChange` of an attribute.

-   We fixed prettier configurations for `jsxBracketSameLine`.

### Added

-   We added support for dark icons (`widgetName`.icon.dark.png and `widgetName`.tile.dark.png).

### Changed

-   We changed `wdio-image-comparison-service` from `devDependencies` to `dependencies`.

-   We updated typescript and prettier versions.

## [9.8.0] - 2021-12-07

### Fixed

-   We fixed the typing generation for `editorPreview` files.

### Added

-   We added a file containing all the dependencies licenses (dependencies.txt) in the release phase of a widget.

### Changed

-   We updated mendix library dependency.

## [9.7.1] - 2021-11-18

### Added

-   We added minification of CSS files inside generated widget MPKs (using `npm run release`).

### Fixed

-   We fixed the compilation of CSS/SASS files imported from libraries (node_modules) (Ticket 133343).

-   We fixed an issue with `@import` and `@use` not working in CSS/SCSS files.

## [9.7.0] - 2021-10-05

### Changed

-   We've updated `@rollup/plugin-typescript` dependency to 8.3.0

-   We've updated `typescript` dependency to 4.4.4

-   We've updated `mendix` dependency to 9.7.0

### Fixed

-   We reverted the feature introduced in 9.5.4 that automatically formatted each build as this caused builds to stall in certain cases.

-   We fixed an issue in Windows machine about missing dependencies (Ticket 132841).

## [9.5.4] - 2021-09-21

### Added

-   We added a feature where the code will be formatted automatically after each build.

### Fixed

-   We fixed an issue with the native release build tooling by disabling code mangling that could cause runtime errors in certain cases.

## [9.5.3] - 2021-09-09

### Fixed

-   We fixed an issue where optional dependencies would cause a build error if not present.

## [9.5.2] - 2021-09-08

### Changed

-   We fixed an issue where the e2e test script overrides a local test project by default. To override the existing local test project, supply the following argument when calling the script: `--update-test-project`.

-   We improved error handling for e2e testing.

### Fixed

-   We fixed an issue where optional peer dependencies would cause a build error if not present.

## [9.5.1] - 2021-09-02

### Changed

-   We fixed an issue with paths containing spaces on windows causing tests (unit and e2e) to throw `Could not find a config file based on provided values`.

## [9.5.0] - 2021-09-01

### Added

-   We added support for icon and tile images. Now you can use an image file instead of `<icon>` in your `MyWidget.xml`. In order to use, please make sure you follow the pattern `src/MyWidget.icon.png` (24x24px) and `src/MyWidget.tile.png` (256x192px)

### Changed

-   We fixed the formatting of Preview typings

-   We fixed the Preview typings for Icon property.

-   We defined a fixed version of `typescript` to 4.3.5 in order to prevent processes to be hanging after creates the widget mpk. See issue [here](https://github.com/rollup/rollup/issues/4213)

-   We updated Mendix library to 9.5.0

## [9.4.3] - 2021-08-12

### Changed

-   We've updated rollup & rollup plugins dependencies.

## [9.4.2] - 2021-08-11

### Changed

-   We changed the behavior of commonjs plugin for rollup to identify the correct way to handle require (as default or not).

## [9.4.1] - 2021-08-05

### Added

-   We added an extra es6 module output (.mjs) for widgets in order to make widgets compatible with modern client.

## [9.4.0] - 2021-07-27

### Changed

-   Updated Mendix package to 9.4.

-   If a datasource property is optional and has not been configured by the user, any properties that are linked to that datasource property are automatically omitted from the props passed to the client component (even if they are marked as required). The generated typings have been updated to reflect this, marking such properties as optional.

## [9.3.1] - 2021-07-13

### Added

-   We added support to download a Mendix test project from a GitHub repository branch.

### Fixed

-   We fixed the preview prop typing generation for data sources.

## [9.3.0] - 2021-07-02

### Added

-   We added support for testing components that make use of SVG images.

## [9.2.1] - 2021-06-16

### Added

-   We reintroduced the possibility to use `.env` file for environment variables (removed in v9 previously)

## [9.2.0] - 2021-05-28

### Changed

-   Update Mendix package to version 9.2.

### Fixed

-   We fixed an issue with external dependencies while code was being converted to CommonJS code.

## [9.1.0] - 2021-05-25

### Changed

-   Update webdriverio package to version 7.

-   Update Mendix package to version 9.1.

-   Replaced `@rollup/plugin-replace` with `rollup-plugin-re` due to `Unexpected errors` being thrown while using Native class based libraries.

## [9.0.3] - 2021-04-26

### Changed

-   Allow only SVG files to be imported in the `editorConfig.ts` file of widgets.

-   Set the file size limit of an imported SVG file to 100 kB.

-   Set required node version to v12 or higher.

-   Note in the README file that installation with NPM v7.x.x requires the flag `--legacy-peer-deps`.
