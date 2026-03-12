# @mendix/vite-config-widgets-web

This package provides Vite configuration for building Mendix pluggable web widgets.


## Installation

```bash
pnpm add -D @mendix/vite-config-widgets-web vite
```

## Contents

- `config.web.ts` – thin orchestrator and public entrypoint.
- `types.ts` – shared types used by the config/build modules.
- `config/` – config derivation and mode handling.
- `build/` – editor artifact and MPK build steps.
- `helpers/` – package metadata/path helpers.
- `test/` – integration tests for end-to-end verification.
- `benchmark.js` – helper script to compare build time and output size between the
  existing Rollup build and the new Vite build for a given widget.

## Usage

Create a local `vite.config.ts` in your widget package:

```ts
import { createWidgetViteConfig } from "@mendix/vite-config-widgets-web/config.web";

export default createWidgetViteConfig();
```

You can optionally override inferred values:

```ts
import { createWidgetViteConfig } from "@mendix/vite-config-widgets-web/config.web";

export default createWidgetViteConfig({
    widgetName: "MyWidget",
    runtimeDirectoryName: "mywidget"
});
```

## Build Modes

This config supports two build modes via the `--mode` flag:

### Development Mode (`--mode dev`)

Development builds prioritize debugging and quick iteration:

- **Minification:** Disabled
- **Source Maps:** Inline (for debugging)
- **Optimization:** Off (preserves code structure)
- **NODE_ENV:** `"development"`
- **Output Size:** Larger MPK (suitable for local dev and CI)

```json
"scripts": {
  "build": "vite build --mode dev"
}
```

### Production Mode (`--mode prod` or default)

Production builds prioritize size and performance:

- **Minification:** Full (esbuild)
- **Source Maps:** None
- **Optimization:** On (tree-shaking, inlining, etc.)
- **NODE_ENV:** `"production"`
- **Output Size:** Smaller MPK (suitable for releases and marketplace)

```json
"scripts": {
  "release": "vite build --mode prod"
}
```

If no mode is specified, production mode is used by default.

## Internal Module Map

- `vite.config.ts`: public exports and Vite `defineConfig` wiring
- `config/create.ts`: top-level Vite config object creation
- `config/resolve.ts`: resolves widget/runtime config and build mode
- `config/infer.ts`: infers file paths/artifacts/editor entries
- `build/editor-artifacts.ts`: builds editor preview/config outputs
- `build/mpk.ts`: stages files and creates the `.mpk`
- `helpers/package-json.ts`: package.json loading and widget name resolution
- `types.ts`: cross-module type definitions

## Development & Testing

### Build Output Structure

The build process creates artifacts in `dist/tmp/widgets/`:

```
dist/
├── tmp/
│   └── widgets/                    # Staging directory for MPK
│       ├── {WidgetName}.xml        # Widget definition
│       ├── package.xml             # Package metadata
│       └── {packagePath}/          # Runtime files
│           └── {runtimeDir}/
│               ├── {WidgetName}.js  # CommonJS bundle
│               └── {WidgetName}.mjs # ES Module bundle
└── {version}/
    └── {WidgetName}.mpk            # Final distributable package
```

### Integration Tests

Integration tests verify the package works end-to-end by building a real widget in an isolated environment:

```bash
# Run integration tests
pnpm test:integration

# Clean test artifacts
pnpm test:integration:clean
```

**How it works:**
1. Creates a temporary directory (using Node.js `tmpdir()`)
2. Packs the vite-config package as a tarball
3. Copies test widget to temp directory
4. Installs dependencies and the packed tarball
5. Builds the test widget
6. Verifies all artifacts (MPK, runtime files, metadata)
7. Copies results to `test/results/` for inspection
8. Cleans up temporary directory

This ensures the package works correctly when installed from npm without interfering with the monorepo.

### Package Scripts

- `pnpm build` - Build the vite config package
- `pnpm test:integration` - Run end-to-end integration tests
- `pnpm test:integration:clean` - Remove test artifacts

