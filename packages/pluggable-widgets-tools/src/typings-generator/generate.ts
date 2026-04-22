import { generateClientTypes } from "./generateClientTypes";
import { generateImports, ImportableModule } from "./generateImports";
import { generatePreviewTypes } from "./generatePreviewTypes";
import { extractProperties, extractSystemProperties } from "./helpers";
import { WidgetXml } from "./WidgetXml";

const importableModules = [
    new ImportableModule("mendix", [
        "ActionValue",
        "AssociationMetaData",
        "AttributeMetaData",
        "DynamicValue",
        "EditableFileValue",
        "EditableImageValue",
        "EditableListValue",
        "EditableValue",
        "FileValue",
        "ListActionValue",
        "ListAttributeListValue",
        "ListAttributeValue",
        "ListExpressionValue",
        "ListReferenceSetValue",
        "ListReferenceValue",
        "ListValue",
        "ListWidgetValue",
        "NativeIcon",
        "NativeImage",
        "Option",
        "ReferenceSetValue",
        "ReferenceValue",
        "SelectionMultiValue",
        "SelectionSingleValue",
        "WebIcon",
        "WebImage"
    ]),
    new ImportableModule("react", ["ComponentType", "CSSProperties", "ReactNode"]),
    new ImportableModule("big.js", ["Big"])
];

export function generateForWidget(widgetXml: WidgetXml, widgetName: string) {
    if (!widgetXml?.widget?.properties) {
        throw new Error("[XML] XML doesn't contains <properties> element");
    }
    if (widgetXml.widget.$.pluginWidget !== "true") {
        throw new Error("[XML] Attribute pluginWidget=true not found. Please review your XML");
    }

    const isNative = widgetXml.widget.$.supportedPlatform === "Native";

    const propElements = widgetXml.widget.properties[0] ?? [];
    const properties = extractProperties(propElements).filter(prop => prop?.$?.key);
    const systemProperties = extractSystemProperties(propElements).filter(prop => prop?.$?.key);

    const clientTypes = generateClientTypes(widgetName, properties, systemProperties, isNative);
    const modelerTypes = generatePreviewTypes(widgetName, properties, systemProperties);

    const generatedTypesCode = clientTypes
        .slice(0, clientTypes.length - 1) // all client auxiliary types
        .concat(modelerTypes.slice(0, modelerTypes.length - 1)) // all preview auxiliary types
        .concat([clientTypes[clientTypes.length - 1], modelerTypes[modelerTypes.length - 1]])
        .join("\n\n");

    const imports = generateImports(importableModules, generatedTypesCode);

    return `/**
 * This file was generated from ${widgetName}.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
${imports.length ? imports.join("\n") + "\n\n" : ""}${generatedTypesCode}
`;
}


