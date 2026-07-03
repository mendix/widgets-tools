export const systemTextsOutput = `/**
 * This file was generated from MyWidget.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { CSSProperties } from "react";

export interface Translations {
    "photo": [];
    "photo_count": [params: [count: string]];
    "mendix.textbox.TextBox": [key: "label" | "placeholder", params?: string[]]
    "mendix.datagrid.DataGrid": [key: string, params?: string[]]
}

export interface MyWidgetContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    texts: {
        translate: <K extends keyof Translations>(key: K, ...params: Translations[K]) => string
    }
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
}
`;

export const systemTextsNativeOutput = `export interface MyWidgetProps<Style> {
    name: string;
    style: Style[];
    texts: {
        translate: <K extends keyof Translations>(key: K, ...params: Translations[K]) => string
    }
}`;
