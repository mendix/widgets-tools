export const singleObjectDatasourceInput = `<?xml version="1.0" encoding="utf-8"?>
<widget id="mendix.mywidget.MyWidget" needsEntityContext="true" offlineCapable="true" pluginWidget="true"
        xmlns="http://www.mendix.com/widget/1.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.mendix.com/widget/1.0/ ../xsd/widget.xsd">
    <properties>
        <propertyGroup caption="General">
            <property key="singleSource" type="datasource" isList="false">
                <caption>Single object data source</caption>
                <description />
            </property>
            <property key="optionalSingleSource" type="datasource" isList="false" required="false">
                <caption>Optional single object data source</caption>
                <description />
            </property>
            <property key="listSource" type="datasource" isList="true">
                <caption>List data source</caption>
                <description />
            </property>
            <property key="singleContent" type="widgets" dataSource="singleSource">
                <caption>Single Content</caption>
                <description />
            </property>
            <property key="singleAttribute" type="attribute" dataSource="singleSource">
                <caption>Single Attribute</caption>
                <description />
                <attributeTypes>
                    <attributeType name="String"/>
                    <attributeType name="Boolean"/>
                    <attributeType name="Decimal"/>
                </attributeTypes>
            </property>
            <property key="singleAction" type="action" dataSource="singleSource">
                <caption>Single Action</caption>
                <description />
            </property>
            <property key="singleTextTemplate" type="textTemplate" dataSource="singleSource">
                <caption>Single Text Template</caption>
                <description />
            </property>
            <property key="singleExpression" type="expression" dataSource="singleSource">
                <caption>Single Expression</caption>
                <description />
                <returnType type="Decimal"/>
            </property>
            <property key="optionalSingleAttribute" type="attribute" dataSource="optionalSingleSource">
                <caption>Optional Single Attribute</caption>
                <description />
                <attributeTypes>
                    <attributeType name="String"/>
                </attributeTypes>
            </property>
            <property key="optionalSingleAction" type="action" dataSource="optionalSingleSource">
                <caption>Optional Single Action</caption>
                <description />
            </property>
            <property key="listContent" type="widgets" dataSource="listSource">
                <caption>List Content</caption>
                <description />
            </property>
            <property key="listAttribute" type="attribute" dataSource="listSource">
                <caption>List Attribute</caption>
                <description />
                <attributeTypes>
                    <attributeType name="String"/>
                </attributeTypes>
            </property>
            <property key="listAction" type="action" dataSource="listSource">
                <caption>List Action</caption>
                <description />
            </property>
        </propertyGroup>
        <propertyGroup caption="System Properties">
            <systemProperty key="Label"></systemProperty>
            <systemProperty key="TabIndex"></systemProperty>
        </propertyGroup>
    </properties>
</widget>`;

export const singleObjectDatasourceInputNative = `<?xml version="1.0" encoding="utf-8"?>
<widget id="mendix.mywidget.MyWidget" needsEntityContext="true" offlineCapable="true" pluginWidget="true" supportedPlatform="Native"
        xmlns="http://www.mendix.com/widget/1.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.mendix.com/widget/1.0/ ../xsd/widget.xsd">
    <properties>
        <propertyGroup caption="General">
            <property key="singleSource" type="datasource" isList="false">
                <caption>Single object data source</caption>
                <description />
            </property>
            <property key="listSource" type="datasource" isList="true">
                <caption>List data source</caption>
                <description />
            </property>
            <property key="singleContent" type="widgets" dataSource="singleSource">
                <caption>Single Content</caption>
                <description />
            </property>
            <property key="singleAttribute" type="attribute" dataSource="singleSource">
                <caption>Single Attribute</caption>
                <description />
                <attributeTypes>
                    <attributeType name="String"/>
                    <attributeType name="Boolean"/>
                    <attributeType name="Decimal"/>
                </attributeTypes>
            </property>
            <property key="singleAction" type="action" dataSource="singleSource">
                <caption>Single Action</caption>
                <description />
            </property>
            <property key="singleTextTemplate" type="textTemplate" dataSource="singleSource">
                <caption>Single Text Template</caption>
                <description />
            </property>
            <property key="singleExpression" type="expression" dataSource="singleSource">
                <caption>Single Expression</caption>
                <description />
                <returnType type="Decimal"/>
            </property>
            <property key="listContent" type="widgets" dataSource="listSource">
                <caption>List Content</caption>
                <description />
            </property>
            <property key="listAttribute" type="attribute" dataSource="listSource">
                <caption>List Attribute</caption>
                <description />
                <attributeTypes>
                    <attributeType name="String"/>
                </attributeTypes>
            </property>
            <property key="listAction" type="action" dataSource="listSource">
                <caption>List Action</caption>
                <description />
            </property>
        </propertyGroup>
    </properties>
</widget>`;
