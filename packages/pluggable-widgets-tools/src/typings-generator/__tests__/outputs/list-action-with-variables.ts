export const listActionWithVariablesOutput = `/**
 * This file was generated from MyWidget.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, EditableValue } from "mendix";
import { Big } from "big.js";

export interface ActionsType {
    description: EditableValue<string>;
    action?: ActionValue<{ boolean_v?: boolean; integer_v?: Big; datetime_v?: Date; string_v?: string; decimal_v?: Big }>;
}

export interface ActionsPreviewType {
    description: string;
    action: {} | null;
}

export interface MyWidgetContainerProps {
    name: string;
    tabIndex?: number;
    id: string;
    actions: ActionsType[];
}

export interface MyWidgetPreviewProps {
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    actions: ActionsPreviewType[];
}
`;
export const listActionWithVariablesOutputNative = `export interface ActionsType {
    description: EditableValue<string>;
    action?: ActionValue<{ boolean_v?: boolean; integer_v?: Big; datetime_v?: Date; string_v?: string; decimal_v?: Big }>;
}

export interface MyWidgetProps<Style> {
    name: string;
    style: Style[];
    actions: ActionsType[];
}`;
