import { parseString } from "xml2js";
import { listActionInput, listActionInputNative } from "./inputs/list-action";
import { listActionNativeOutput, listActionWebOutput } from "./outputs/list-action";
import { listAssociationWebInput, listAssociationNativeInput } from "./inputs/list-association";
import { listAssociationNativeOutput, listAssociationWebOutput } from "./outputs/list-association";
import { listImageInput, listImageInputNative } from "./inputs/list-image";
import { listImageNativeOutput, listImageWebOutput } from "./outputs/list-image";
import { iconInput, iconInputNative } from "./inputs/icon";
import { iconNativeOutput, iconWebOutput } from "./outputs/icon";
import { containmentInput, containmentInputNative } from "./inputs/containment";
import { containmentNativeOutput, containmentWebOutput } from "./outputs/containment";
import { fileInput, fileInputNative } from "./inputs/file";
import { fileNativeOutput, fileWebOutput } from "./outputs/file";
import { listFileInput, listFileInputNative } from "./inputs/list-files";
import { listFileNativeOutput, listFileWebOutput } from "./outputs/list-files";
import { datasourceInput, datasourceInputNative } from "./inputs/datasource";
import { datasourceNativeOutput, datasourceWebOutput } from "./outputs/datasource";
import { generateForWidget } from "../generate";
import { generateClientTypes } from "../generateClientTypes";
import { extractProperties, extractSystemProperties } from "../helpers";
import { WidgetXml } from "../WidgetXml";
import { content, contentGroup, contentGroupNative, contentNative } from "./inputs";
import { nativeResult, webResult, webResultGroup } from "./outputs";
import { attributeLinkedActionInput, attributeNestedLinkedActionInput } from "./inputs/atribute-linked-action";
import { attributeLinkedActionOutput, attributeNestedLinkedActionOutput } from "./outputs/atribute-linked-action";
import { associationInput, associationInputNative } from "./inputs/association";
import { associationNativeOutput, associationWebOutput } from "./outputs/association";
import { expressionInput, expressionInputNative } from "./inputs/expression";
import { expressionWebOutput, expressionNativeOutput } from "./outputs/expression";
import { selectionInput, selectionInputNative } from "./inputs/selection";
import { selectionNativeOutput, selectionWebOutput } from "./outputs/selection";
import { listAttributeNativeInput, listAttributeWebInput } from "./inputs/list-attribute-refset";
import { listAttributeNativeOutput, listAttributeWebOutput } from "./outputs/list-attribute-refset";
import {
    nonLinkedListAttributeNativeInput,
    nonLinkedListAttributeWebInput
} from "./inputs/non-linked-list-attribute-refset";
import {
    nonLinkedListAttributeNativeOutput,
    nonLinkedListAttributeWebOutput
} from "./outputs/non-linked-list-attribute-refset";
import { attributeMetaDataNativeInput, attributeMetaDataWebInput } from "./inputs/metadata-attribute";
import { attributeMetaDataNativeOutput, attributeMetaDataWebOutput } from "./outputs/metadata-attribute";
import { associationMetaDataNativeInput, associationMetaDataWebInput } from "./inputs/metadata-association";
import { associationMetaDataNativeOutput, associationMetaDataWebOutput } from "./outputs/metadata-association";
import {listActionWithVariablesInput, listActionWithVariablesInputNative} from "./inputs/list-action-with-variables";
import {listActionWithVariablesOutput, listActionWithVariablesOutputNative} from "./outputs/list-action-with-variables";
import {imageWebInput, imageNativeInput} from "./inputs/image";
import {imageWebOutput, imageNativeOutput} from "./outputs/image";

describe("Generating tests", () => {
    it("Generates a parsed typing from XML for native", () => {
        const newContent = generateFullTypesFor(contentNative);
        expect(newContent).toBe(nativeResult);
    });

    it("Generates a parsed typing from XML for web", () => {
        const newContent = generateFullTypesFor(content);
        expect(newContent).toBe(webResult);
    });

    it("Generates a parsed typing from XML for native with groups", () => {
        const newContent = generateFullTypesFor(contentGroupNative);
        expect(newContent).toBe(nativeResult);
    });

    it("Generates a parsed typing from XML for web with groups", () => {
        const newContent = generateFullTypesFor(contentGroup);
        expect(newContent).toBe(webResultGroup);
    });

    it("Generates a parsed typing from XML for native using list of actions", () => {
        const newContent = generateNativeTypesFor(listActionInputNative);
        expect(newContent).toBe(listActionNativeOutput);
    });

    it("Generates a parsed typing from XML for web using list of actions", () => {
        const newContent = generateFullTypesFor(listActionInput);
        expect(newContent).toBe(listActionWebOutput);
    });

    it("Generates a parsed typing from XML for native using list of actions with variables", () => {
        const newContent = generateNativeTypesFor(listActionWithVariablesInputNative);
        expect(newContent).toBe(listActionWithVariablesOutputNative);
    });

    it("Generates a parsed typing from XML for web using list of actions with variables", () => {
        const newContent = generateFullTypesFor(listActionWithVariablesInput);
        expect(newContent).toBe(listActionWithVariablesOutput);
    });

    it("Generates a parsed typing from XML for native using list of images", () => {
        const newContent = generateNativeTypesFor(listImageInputNative);
        expect(newContent).toBe(listImageNativeOutput);
    });

    it("Generates a parsed typing from XML for web using list of images", () => {
        const newContent = generateFullTypesFor(listImageInput);
        expect(newContent).toBe(listImageWebOutput);
    });

    it("Generates a parsed typing from XML for native using icons", () => {
        const newContent = generateNativeTypesFor(iconInputNative);
        expect(newContent).toBe(iconNativeOutput);
    });

    it("Generates a parsed typing from XML for web using icons", () => {
        const newContent = generateFullTypesFor(iconInput);
        expect(newContent).toBe(iconWebOutput);
    });

    it("Generates a parsed typing from XML for web using containment", () => {
        const newContent = generateFullTypesFor(containmentInput);
        expect(newContent).toBe(containmentWebOutput);
    });

    it("Generates a parsed typing from XML for native using containment", () => {
        const newContent = generateNativeTypesFor(containmentInputNative);
        expect(newContent).toBe(containmentNativeOutput);
    });

    it("Generates a parsed typing from XML for web using file", () => {
        const newContent = generateFullTypesFor(fileInput);
        expect(newContent).toBe(fileWebOutput);
    });

    it("Generates a parsed typing from XML for native using file", () => {
        const newContent = generateNativeTypesFor(fileInputNative);
        expect(newContent).toBe(fileNativeOutput);
    });

    it("Generates a parsed typing from XML for web using a list of file", () => {
        const newContent = generateFullTypesFor(listFileInput);
        expect(newContent).toBe(listFileWebOutput);
    });

    it("Generates a parsed typing from XML for native using a list of file", () => {
        const newContent = generateNativeTypesFor(listFileInputNative);
        expect(newContent).toBe(listFileNativeOutput);
    });

    it("Generates a parsed typing from XML for web using datasource", () => {
        const newContent = generateFullTypesFor(datasourceInput);
        expect(newContent).toBe(datasourceWebOutput);
    });

    it("Generates a parsed typing from XML for native using datasource", () => {
        const newContent = generateNativeTypesFor(datasourceInputNative);
        expect(newContent).toBe(datasourceNativeOutput);
    });

    it("Generates a parsed typing from XML for widget with attribute linked action", () => {
        const newContent = generateFullTypesFor(attributeLinkedActionInput);
        expect(newContent).toBe(attributeLinkedActionOutput);
    });

    it("Generates a parsed typing from XML for widget with attribute nested linked action", () => {
        const newContent = generateFullTypesFor(attributeNestedLinkedActionInput);
        expect(newContent).toBe(attributeNestedLinkedActionOutput);
    });

    it("Generates a parsed typing from XML for web using association", () => {
        const newContent = generateFullTypesFor(associationInput);
        expect(newContent).toBe(associationWebOutput);
    });

    it("Generates a parsed typing from XML for native using association", () => {
        const newContent = generateNativeTypesFor(associationInputNative);
        expect(newContent).toBe(associationNativeOutput);
    });

    it("Generates a parsed typing from XML for web using linked association", () => {
        const newContent = generateFullTypesFor(listAssociationWebInput);
        expect(newContent).toBe(listAssociationWebOutput);
    });

    it("Generates a parsed typing from XML for native using linked association", () => {
        const newContent = generateNativeTypesFor(listAssociationNativeInput);
        expect(newContent).toBe(listAssociationNativeOutput);
    });

    it("Generates a parsed typing from XML for web using expression", () => {
        const newContent = generateFullTypesFor(expressionInput);
        expect(newContent).toBe(expressionWebOutput);
    });

    it("Generates a parsed typing from XML for native using expression", () => {
        const newContent = generateNativeTypesFor(expressionInputNative);
        expect(newContent).toBe(expressionNativeOutput);
    });

    it("Generates a parsed typing from XML for web using selection", () => {
        const newContent = generateFullTypesFor(selectionInput);
        expect(newContent).toBe(selectionWebOutput);
    });

    it("Generates a parsed typing from XML for native using selection", () => {
        const newContent = generateNativeTypesFor(selectionInputNative);
        expect(newContent).toBe(selectionNativeOutput);
    });

    it("Generates a parsed typing from XML for web using ref sets in linked attribute", () => {
        const newContent = generateFullTypesFor(listAttributeWebInput);
        expect(newContent).toBe(listAttributeWebOutput);
    });

    it("Generates a parsed typing from XML for native using ref sets in linked attribute", () => {
        const newContent = generateNativeTypesFor(listAttributeNativeInput);
        expect(newContent).toBe(listAttributeNativeOutput);
    });

    it("Generates a parsed typing from XML for web using ref sets in non-linked attribute", () => {
        const newContent = generateFullTypesFor(nonLinkedListAttributeWebInput);
        expect(newContent).toBe(nonLinkedListAttributeWebOutput);
    });

    it("Generates a parsed typing from XML for native using ref sets in non-linked attribute", () => {
        const newContent = generateNativeTypesFor(nonLinkedListAttributeNativeInput);
        expect(newContent).toBe(nonLinkedListAttributeNativeOutput);
    });

    it("Generates a parsed typing from XML for web using metadata attribute", () => {
        const newContent = generateFullTypesFor(attributeMetaDataWebInput);
        expect(newContent).toBe(attributeMetaDataWebOutput);
    });

    it("Generates a parsed typing from XML for native using metadata attribute", () => {
        const newContent = generateNativeTypesFor(attributeMetaDataNativeInput);
        expect(newContent).toBe(attributeMetaDataNativeOutput);
    });

    it("Generates a parsed typing from XML for web using metadata association", () => {
        const newContent = generateFullTypesFor(associationMetaDataWebInput);
        expect(newContent).toBe(associationMetaDataWebOutput);
    });

    it("Generates a parsed typing from XML for native using metadata association", () => {
        const newContent = generateNativeTypesFor(associationMetaDataNativeInput);
        expect(newContent).toBe(associationMetaDataNativeOutput);
    });
    
    it("Generates a parsed typing from XML for web using images", () => {
        const newContent = generateFullTypesFor(imageWebInput);
        expect(newContent).toBe(imageWebOutput);
    });

     it("Generates a parsed typing from XML for native using images", () => {
        const newContent = generateNativeTypesFor(imageNativeInput);
        expect(newContent).toBe(imageNativeOutput);
    });
});

function generateFullTypesFor(xml: string) {
    return generateForWidget(convertXmltoJson(xml), "MyWidget");
}

function generateNativeTypesFor(xml: string) {
    const widgetXml = convertXmltoJson(xml);
    const properties = widgetXml!.widget!.properties[0];
    return generateClientTypes(
        "MyWidget",
        extractProperties(properties),
        extractSystemProperties(properties),
        true
    ).join("\n\n");
}

function convertXmltoJson(xml: string): WidgetXml {
    let content: WidgetXml = {};
    if (xml) {
        parseString(xml, {}, (err: Error, result: any) => {
            if (err) {
                throw err;
            }
            content = result as WidgetXml;
        });
    }
    return content;
}
