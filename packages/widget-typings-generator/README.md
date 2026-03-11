# @mendix/widget-typings-generator

TypeScript typings generator for Mendix Pluggable Widgets.

## Overview

Generates TypeScript definition files (`.d.ts`) from Mendix widget XML schema files, providing type-safe development experience for widget creators.

## Usage

### Basic Usage

```typescript
import { transformPackage } from "@mendix/widget-typings-generator";
import { readFile } from "fs/promises";

// Read your widget's package.xml
const packageXml = await readFile("./src/{WidgetName}.xml", "utf-8");

// Generate TypeScript definitions
await transformPackage(packageXml, "./src");
```

This will:
1. Parse `{WidgetName}.xml` to find all widget XML files
2. Generate TypeScript interfaces for each widget
3. Create `.d.ts` files in `../typings/{WidgetName}.xml/` directory

### Generated Types

For a widget named `MyWidget`, it generates:
- **Web:** `MyWidgetContainerProps` (runtime) and `MyWidgetPreviewProps` (Studio Pro)
- **Native:** `MyWidgetProps<Style>` (runtime) and `MyWidgetPreviewProps` (Studio Pro)

### Integration with Rollup

```javascript
import { transformPackage } from "@mendix/widget-typings-generator";
import { readFile } from "fs/promises";

export function widgetTypingPlugin({ sourceDir }) {
    return {
        name: "widget-typing",
        async buildStart() {
            const packageXml = await readFile(`${sourceDir}/package.xml`, "utf-8");
            await transformPackage(packageXml, sourceDir);
        }
    };
}
```

## API

### `transformPackage(content: string, basePath: string): Promise<void>`

Parses package.xml and generates TypeScript definitions for all widgets.

**Parameters:**
- `content` - XML content of package.xml file
- `basePath` - Base directory path for resolving widget XML files

**Returns:** Promise that resolves when all type files are generated

**Throws:** Error if XML parsing fails or widget structure is invalid

## Supported Property Types

The generator supports all Mendix widget property types:
- Actions (single, list, with variables)
- Attributes (string, boolean, integer, decimal, datetime, etc.)
- Associations (reference, reference set)
- Datasources (with filtering, sorting)
- Expressions (with type validation)
- Objects (nested properties)
- Icons, Images, Files
- Enumerations, Selections
- Text templates, Widgets (containment)

## License

Apache-2.0 © Mendix Technology BV 2026. All rights reserved.
