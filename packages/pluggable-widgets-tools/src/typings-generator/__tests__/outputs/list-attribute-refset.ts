export const listAttributeWebOutput = `/**
 * This file was generated from MyWidget.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { ListValue, ListAttributeValue, ListAttributeListValue } from "mendix";

export interface MyWidgetContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    dataSource?: ListValue;
    referenceDefault?: ListAttributeValue<string>;
    reference?: ListAttributeValue<string>;
    referenceSet?: ListAttributeListValue<string>;
    referenceOrSet?: ListAttributeValue<string> | ListAttributeListValue<string>;
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
    dataSource: {} | { caption: string } | { type: string } | null;
    referenceDefault: string;
    reference: string;
    referenceSet: string;
    referenceOrSet: string;
}
`;

export const listAttributeNativeOutput = `export interface MyWidgetProps<Style> {
    name: string;
    style: Style[];
    dataSource?: ListValue;
    referenceDefault?: ListAttributeValue<string>;
    reference?: ListAttributeValue<string>;
    referenceSet?: ListAttributeListValue<string>;
    referenceOrSet?: ListAttributeValue<string> | ListAttributeListValue<string>;
}`;
