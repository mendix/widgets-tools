export const associationMetaDataWebInput = `<?xml version="1.0" encoding="utf-8"?>
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
            <property key="metaReference" type="association" isMetaData="true" dataSource="data">
                <caption>Reference</caption>
                <description />
                <associationTypes>
                    <associationType name="Reference" />
                </associationTypes>
            </property>
            <property key="metaReferenceSet" type="association" isMetaData="true" dataSource="data">
                <caption>Reference</caption>
                <description />
                <associationTypes>
                    <associationType name="ReferenceSet" />
                </associationTypes>
            </property>
        </propertyGroup>
    </properties>
</widget>`;
export const associationMetaDataNativeInput = `<?xml version="1.0" encoding="utf-8"?>
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
            <property key="metaReference" type="association" isMetaData="true" dataSource="data">
                <caption>Reference</caption>
                <description />
                <associationTypes>
                    <associationType name="Reference" />
                </associationTypes>
            </property>
            <property key="metaReferenceSet" type="association" isMetaData="true" dataSource="data">
                <caption>Reference</caption>
                <description />
                <associationTypes>
                    <associationType name="ReferenceSet" />
                </associationTypes>
            </property>
        </propertyGroup>
    </properties>
</widget>`;
