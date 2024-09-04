export const attributeMetaDataWebOutput = `/**
 * This file was generated from MyWidget.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { AttributeMetaData, ListValue } from "mendix";
import { Big } from "big.js";

export interface MyWidgetContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    data: ListValue;
    metaString: AttributeMetaData<string>;
    metaNumberDate: AttributeMetaData<Big | Date>;
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
    renderMode?: "design" | "xray" | "structure";
    data: {} | { caption: string } | { type: string } | null;
    metaString: string;
    metaNumberDate: string;
}
`;

export const attributeMetaDataNativeOutput = `export interface MyWidgetProps<Style> {
    name: string;
    style: Style[];
    data: ListValue;
    metaString: AttributeMetaData<string>;
    metaNumberDate: AttributeMetaData<Big | Date>;
}`;
