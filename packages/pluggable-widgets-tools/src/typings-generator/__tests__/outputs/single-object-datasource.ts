export const singleObjectDatasourceWebOutput = `/**
 * This file was generated from MyWidget.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, EditableValue, ListActionValue, ListAttributeValue, ListValue, ListWidgetValue, ObjectItem } from "mendix";
import { ComponentType, ReactNode } from "react";
import { Big } from "big.js";

export interface MyWidgetContainerProps {
    name: string;
    tabIndex?: number;
    id: string;
    singleSource: DynamicValue<ObjectItem>;
    optionalSingleSource?: DynamicValue<ObjectItem>;
    listSource: ListValue;
    singleContent: ReactNode;
    singleAttribute: EditableValue<string | boolean | Big>;
    singleAction?: ActionValue;
    singleTextTemplate: DynamicValue<string>;
    singleExpression: DynamicValue<Big>;
    optionalSingleAttribute?: EditableValue<string>;
    optionalSingleAction?: ActionValue;
    listContent: ListWidgetValue;
    listAttribute: ListAttributeValue<string>;
    listAction?: ListActionValue;
}

export interface MyWidgetPreviewProps {
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    singleSource: {} | { caption: string } | { type: string } | null;
    optionalSingleSource: {} | { caption: string } | { type: string } | null;
    listSource: {} | { caption: string } | { type: string } | null;
    singleContent: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    singleAttribute: string;
    singleAction: {} | null;
    singleTextTemplate: string;
    singleExpression: string;
    optionalSingleAttribute: string;
    optionalSingleAction: {} | null;
    listContent: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    listAttribute: string;
    listAction: {} | null;
}
`;

export const singleObjectDatasourceNativeOutput = `export interface MyWidgetProps<Style> {
    name: string;
    style: Style[];
    singleSource: DynamicValue<ObjectItem>;
    listSource: ListValue;
    singleContent: ReactNode;
    singleAttribute: EditableValue<string | boolean | Big>;
    singleAction?: ActionValue;
    singleTextTemplate: DynamicValue<string>;
    singleExpression: DynamicValue<Big>;
    listContent: ListWidgetValue;
    listAttribute: ListAttributeValue<string>;
    listAction?: ListActionValue;
}`;
