export const imageWebOutput = `/**
 * This file was generated from MyWidget.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ActionValue, DynamicValue, EditableValue, EditableImageValue, WebImage } from "mendix";

export interface MyWidgetContainerProps {
    name: string;
    tabIndex?: number;
    id: string;
    image: DynamicValue<WebImage>;
    image2?: DynamicValue<WebImage>;
    image3: EditableImageValue<WebImage>;
    description: EditableValue<string>;
    action?: ActionValue;
}

export interface MyWidgetPreviewProps {
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    image: { type: "static"; imageUrl: string; } | { type: "dynamic"; entity: string; } | null;
    image2: { type: "static"; imageUrl: string; } | { type: "dynamic"; entity: string; } | null;
    image3: { type: "static"; imageUrl: string; } | { type: "dynamic"; entity: string; } | null;
    description: string;
    action: {} | null;
}
`;
export const imageNativeOutput = `export interface MyWidgetProps<Style> {
    name: string;
    style: Style[];
    image: DynamicValue<NativeImage>;
    image2?: DynamicValue<NativeImage>;
    image3: DynamicValue<NativeImage>;
    description: EditableValue<string>;
    action?: ActionValue;
}`;
