export const attributeMetaDataWebInput = `<?xml version="1.0" encoding="utf-8"?>
<widget id="mendix.mywidget.MyWidget" needsEntityContext="true" offlineCapable="true"
    pluginWidget="true" supportedPlatform="Web"
    xmlns="http://www.mendix.com/widget/1.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.mendix.com/widget/1.0/ ../xsd/widget.xsd">
    <properties>
        <propertyGroup caption="General">
            <property key="data" type="datasource" isList="true">
                <caption>Reference</caption>
                <description />
            </property>
            <property key="metaString" type="attribute" isMetaData="true" dataSource="data">
                <caption>Reference</caption>
                <description />
                <attributeTypes>
                    <attributeType name="String" />
                </attributeTypes>
            </property>
            <property key="metaNumberDate" type="attribute" isMetaData="true" dataSource="data">
                <caption>Reference</caption>
                <description />
                <attributeTypes>
                    <attributeType name="Integer" />
                    <attributeType name="DateTime" />
                </attributeTypes>
            </property>
        </propertyGroup>
    </properties>
</widget>`;
export const attributeMetaDataNativeInput = `<?xml version="1.0" encoding="utf-8"?>
<widget id="mendix.mywidget.MyWidget" needsEntityContext="true" offlineCapable="true"
    pluginWidget="true" supportedPlatform="Native"
    xmlns="http://www.mendix.com/widget/1.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.mendix.com/widget/1.0/ ../xsd/widget.xsd">
    <properties>
        <propertyGroup caption="General">
            <property key="data" type="datasource" isList="true">
                <caption>Reference</caption>
                <description />
            </property>
            <property key="metaString" type="attribute" isMetaData="true" dataSource="data">
                <caption>Reference</caption>
                <description />
                <attributeTypes>
                    <attributeType name="String" />
                </attributeTypes>
            </property>
            <property key="metaNumberDate" type="attribute" isMetaData="true" dataSource="data">
                <caption>Reference</caption>
                <description />
                <attributeTypes>
                    <attributeType name="Integer" />
                    <attributeType name="DateTime" />
                </attributeTypes>
            </property>
        </propertyGroup>
    </properties>
</widget>`;
