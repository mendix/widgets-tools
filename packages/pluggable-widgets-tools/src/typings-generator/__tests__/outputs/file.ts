export const fileWebOutput = `/**
 * This file was generated from MyWidget.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, EditableValue, EditableFileValue, FileValue } from "mendix";

export interface MyWidgetContainerProps {
    name: string;
    tabIndex?: number;
    id: string;
    file: DynamicValue<FileValue>;
    file2?: DynamicValue<FileValue>;
    file3: EditableFileValue<FileValue>;
    description: EditableValue<string>;
    action?: ActionValue;
}

export interface MyWidgetPreviewProps {
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    file: string;
    file2: string;
    file3: string;
    description: string;
    action: {} | null;
}
`;
export const fileNativeOutput = `export interface MyWidgetProps<Style> {
    name: string;
    style: Style[];
    file: DynamicValue<FileValue>;
    file2?: DynamicValue<FileValue>;
    file3: EditableFileValue<FileValue>;
    description: EditableValue<string>;
    action?: ActionValue;
}`;
