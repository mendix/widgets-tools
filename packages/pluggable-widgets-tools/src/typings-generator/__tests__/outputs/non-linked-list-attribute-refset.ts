export const nonLinkedListAttributeWebOutput = `/**
 * This file was generated from MyWidget.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { EditableValue, EditableListValue } from "mendix";

export interface MyWidgetContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    referenceDefault: EditableValue<string>;
    reference: EditableValue<string>;
    referenceSet: EditableListValue<string>;
    referenceOrSet: EditableValue<string> | EditableListValue<string>;
}

export interface MyWidgetPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    referenceDefault: string;
    reference: string;
    referenceSet: string;
    referenceOrSet: string;
}
`;

export const nonLinkedListAttributeNativeOutput = `export interface MyWidgetProps<Style> {
    name: string;
    style: Style[];
    referenceDefault: EditableValue<string>;
    reference: EditableValue<string>;
    referenceSet: EditableListValue<string>;
    referenceOrSet: EditableValue<string> | EditableListValue<string>;
}`;
