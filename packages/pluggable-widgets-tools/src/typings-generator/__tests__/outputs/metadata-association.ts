export const associationMetaDataWebOutput = `/**
 * This file was generated from MyWidget.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";
import { AssociationMetaData, ListValue } from "mendix";

export interface MyWidgetContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    data: ListValue;
    metaReference: AssociationMetaData;
    metaReferenceSet: AssociationMetaData;
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
    metaReference: string;
    metaReferenceSet: string;
}
`;

export const associationMetaDataNativeOutput = `export interface MyWidgetProps<Style> {
    name: string;
    style: Style[];
    data: ListValue;
    metaReference: AssociationMetaData;
    metaReferenceSet: AssociationMetaData;
}`;
