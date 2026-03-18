export const imageWebInput = `<?xml version="1.0" encoding="utf-8"?>
<widget id="mendix.mywidget.MyWidget" needsEntityContext="true" offlineCapable="true" pluginWidget="true"
        xmlns="http://www.mendix.com/widget/1.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.mendix.com/widget/1.0/ ../xsd/widget.xsd">
    <properties>
        <propertyGroup caption="General">
            <property key="image" type="image">
                <caption>Image</caption>
                <description />
            </property>
            <property key="image2" type="image" required="false">
                <caption>Image 2</caption>
                <description />
            </property>
            <property key="image3" type="image" allowUpload="true">
                <caption>Image 3</caption>
                <description />
            </property>
        </propertyGroup>
        <propertyGroup caption="Actions">
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
            </property>
        </propertyGroup>
        <propertyGroup caption="Other">
            <propertyGroup caption="System Properties">
                <systemProperty key="Label"></systemProperty>
                <systemProperty key="TabIndex"></systemProperty>
            </propertyGroup>
        </propertyGroup>
    </properties>
</widget>`;

export const imageNativeInput = `<?xml version="1.0" encoding="utf-8"?>
<widget id="mendix.mywidget.MyWidget" needsEntityContext="true" offlineCapable="true" pluginWidget="true" supportedPlatform="Native"
        xmlns="http://www.mendix.com/widget/1.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.mendix.com/widget/1.0/ ../xsd/widget.xsd">
    <properties>
         <propertyGroup caption="General">
            <property key="image" type="image">
                <caption>Image</caption>
                <description />
            </property>
            <property key="image2" type="image" required="false">
                <caption>Image 2</caption>
                <description />
            </property>
             <property key="image3" type="image" allowUpload="true">
                <caption>Image 3</caption>
                <description />
            </property>
        </propertyGroup>
        <propertyGroup caption="Actions">
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
            </property>
        </propertyGroup>
        <propertyGroup caption="Other">
            <propertyGroup caption="System Properties">
                <systemProperty key="Label"></systemProperty>
                <systemProperty key="TabIndex"></systemProperty>
            </propertyGroup>
        </propertyGroup>
    </properties>
</widget>`;
