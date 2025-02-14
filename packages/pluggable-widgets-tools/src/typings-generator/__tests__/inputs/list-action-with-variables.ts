export const listActionWithVariablesInput = `<?xml version="1.0" encoding="utf-8"?>
<widget id="mendix.mywidget.MyWidget" needsEntityContext="true" offlineCapable="true" pluginWidget="true"
        xmlns="http://www.mendix.com/widget/1.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.mendix.com/widget/1.0/ ../xsd/widget.xsd">
    <properties>
        <propertyGroup caption="Events">
            <property key="actions" type="object" isList="true">
                <caption>Actions</caption>
                <description />
                <properties>
                    <propertyGroup caption="Action">
                        <property key="description" type="attribute">
                            <caption>Action</caption>
                            <description />
                            <attributeTypes>
                                <attributeType name="String"/>
                            </attributeTypes>    
                        </property>
                        <property key="action" type="action">
                            <caption>Action</caption>
                            <description />
                            <actionVariables>
                                <actionVariable key="boolean_v" type="Boolean" caption="Boolean" />
                                <actionVariable key="integer_v" type="Integer" caption="Integer" />
                                <actionVariable key="datetime_v" type="DateTime" caption="DateTime" />
                                <actionVariable key="string_v" type="String" caption="String" />
                                <actionVariable key="decimal_v" type="Decimal" caption="Decimal" />
                            </actionVariables>
                        </property>
                    </propertyGroup>
                 </properties>
            </property>
        </propertyGroup>
        <propertyGroup caption="System Properties">
            <systemProperty key="Label"></systemProperty>
            <systemProperty key="TabIndex"></systemProperty>
        </propertyGroup>
    </properties>
</widget>`;

export const listActionWithVariablesInputNative = `<?xml version="1.0" encoding="utf-8"?>
<widget id="mendix.mywidget.MyWidget" needsEntityContext="true" offlineCapable="true" pluginWidget="true" supportedPlatform="Native"
        xmlns="http://www.mendix.com/widget/1.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.mendix.com/widget/1.0/ ../xsd/widget.xsd">
    <properties>
        <propertyGroup caption="Events">
            <property key="actions" type="object" isList="true">
                <caption>Actions</caption>
                <description />
                <properties>
                    <propertyGroup caption="Action">
                        <property key="description" type="attribute">
                            <caption>Action</caption>
                            <description />
                            <attributeTypes>
                                <attributeType name="String"/>
                            </attributeTypes>    
                        </property>
                        <property key="action" type="action">
                            <caption>Action</caption>
                            <description />
                            <actionVariables>
                                <actionVariable key="boolean_v" type="Boolean" caption="Boolean" />
                                <actionVariable key="integer_v" type="Integer" caption="Integer" />
                                <actionVariable key="datetime_v" type="DateTime" caption="DateTime" />
                                <actionVariable key="string_v" type="String" caption="String" />
                                <actionVariable key="decimal_v" type="Decimal" caption="Decimal" /> 
                            </actionVariables>
                        </property>
                    </propertyGroup>
                 </properties>
            </property>
        </propertyGroup>
        <propertyGroup caption="System Properties">
            <systemProperty key="Label"></systemProperty>
            <systemProperty key="TabIndex"></systemProperty>
        </propertyGroup>
    </properties>
</widget>`;
