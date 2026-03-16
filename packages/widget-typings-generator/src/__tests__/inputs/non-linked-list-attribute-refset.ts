export const nonLinkedListAttributeWebInput = `<?xml version="1.0" encoding="utf-8"?>
<widget id="mendix.mywidget.MyWidget" needsEntityContext="true" offlineCapable="true" pluginWidget="true"
        xmlns="http://www.mendix.com/widget/1.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.mendix.com/widget/1.0/ ../xsd/widget.xsd">
    <properties>
        <propertyGroup caption="General">
             <property key="referenceDefault" type="attribute">
                <caption>Reference</caption>
                <description/>
                <attributeTypes>
                    <attributeType name="String" />
                </attributeTypes>
            </property>
            <property key="reference" type="attribute">
                <caption>Reference</caption>
                <description/>
                <attributeTypes>
                    <attributeType name="String" />
                </attributeTypes>
                <associationTypes>
                    <associationType name="Reference"/>
                </associationTypes>
            </property>
            <property key="referenceSet" type="attribute">
                <caption>Reference Set</caption>
                <description/>
                <attributeTypes>
                    <attributeType name="String" />
                </attributeTypes>
                <associationTypes>
                    <associationType name="ReferenceSet"/>
                </associationTypes>
            </property>
            <property key="referenceOrSet" type="attribute">
                <caption>Reference or Set</caption>
                <description/>
                <attributeTypes>
                    <attributeType name="String" />
                </attributeTypes>
                <associationTypes>
                    <associationType name="Reference"/>
                    <associationType name="ReferenceSet"/>
                </associationTypes>
            </property>
        </propertyGroup>
    </properties>
</widget>`;

export const nonLinkedListAttributeNativeInput = `<?xml version="1.0" encoding="utf-8"?>
<widget id="mendix.mywidget.MyWidget" needsEntityContext="true" offlineCapable="true" pluginWidget="true" supportedPlatform="Native"
        xmlns="http://www.mendix.com/widget/1.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.mendix.com/widget/1.0/ ../xsd/widget.xsd">
    <properties>
        <propertyGroup caption="General">
             <property key="referenceDefault" type="attribute">
                <caption>Reference</caption>
                <description/>
                <attributeTypes>
                    <attributeType name="String" />
                </attributeTypes>
            </property>
            <property key="reference" type="attribute">
                <caption>Reference</caption>
                <description/>
                <attributeTypes>
                    <attributeType name="String" />
                </attributeTypes>
                <associationTypes>
                    <associationType name="Reference"/>
                </associationTypes>
            </property>
            <property key="referenceSet" type="attribute">
                <caption>Reference Set</caption>
                <description/>
                <attributeTypes>
                    <attributeType name="String" />
                </attributeTypes>
                <associationTypes>
                    <associationType name="ReferenceSet"/>
                </associationTypes>
            </property>
            <property key="referenceOrSet" type="attribute">
                <caption>Reference or Set</caption>
                <description/>
                <attributeTypes>
                    <attributeType name="String" />
                </attributeTypes>
                <associationTypes>
                    <associationType name="Reference"/>
                    <associationType name="ReferenceSet"/>
                </associationTypes>
            </property>
        </propertyGroup>
    </properties>
</widget>`;