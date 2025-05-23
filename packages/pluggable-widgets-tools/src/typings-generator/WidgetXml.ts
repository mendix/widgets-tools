export interface WidgetXml {
    widget?: Widget;
}

export interface Widget {
    $: {
        id: string;
        supportedPlatform?: string;
        needsEntityContext?: string;
        offlineCapable?: string;
        pluginWidget: string;
    };
    name: string;
    description: string;
    icon: string;
    properties: Properties[];
}

export interface Properties {
    property?: Property[];
    propertyGroup?: PropertyGroup[];
    systemProperty?: SystemProperty[];
}

export interface Property {
    $: {
        key: string;
        type:
            | "boolean"
            | "string"
            | "action"
            | "textTemplate"
            | "integer"
            | "decimal"
            | "icon"
            | "image"
            | "file"
            | "datasource"
            | "attribute"
            | "association"
            | "expression"
            | "enumeration"
            | "object"
            | "widgets"
            | "selection";
        isList?: string;
        isLinked?: string;
        isMetaData?: string;
        defaultValue?: string;
        required?: string;
        isDefault?: string;
        dataSource?: string;
        onChange?: string;
    };
    caption?: string[];
    category?: string[];
    description?: string[];
    attributeTypes?: AttributeTypes[];
    associationTypes?: AssociationTypes[];
    returnType?: ReturnType[];
    properties?: Properties[];
    enumerationValues?: Enumeration[];
    selectionTypes?: SelectionTypes[];
    actionVariables?: ActionVariableTypes[];
}

export interface AttributeType {
    $: {
        name: string;
    };
}

export interface AttributeTypes {
    attributeType: AttributeType[];
}

export interface AssociationType {
    $: {
        name: string;
    };
}

export interface AssociationTypes {
    associationType: AssociationType[];
}

export interface ReturnType {
    $: {
        type?: string;
        assignableTo?: string;
    };
}

export interface PropertyGroup {
    $: {
        caption: string;
    };
    propertyGroup?: PropertyGroup[];
    property?: Property[];
}

export interface SystemProperty {
    $: {
        key: string;
    };
}

export interface Enumeration {
    enumerationValue: EnumerationValue[];
}

export interface EnumerationValue {
    $: {
        key: string;
    };
}

export interface SelectionTypes {
    selectionType: SelectionType[];
}

export interface SelectionType {
    $: {
        name: string;
    };
}

export interface ActionVariableTypes {
    actionVariable: ActionVariableType[];
}

export interface ActionVariableType {
    $: {
        key: string;
        type: string;
    };
}
