const systemProperty = `<systemProperty key="Text">
    <text key="photo">
        <caption>Photo</caption>
        <translations>
            <translation lang="en_US">Photo</translation>
            <translation lang="nl_NL">Foto</translation>
        </translations>
    </text>
    <text key="photo_count">
        <caption>Photo Count</caption>
        <translations>
            <translation lang="en_US">{1} Photos</translation>
            <translation lang="nl_NL">{1} Foto's</translation>
        </translations>
        <parameters>
            <parameter caption="Count" />
        </parameters>
    </text>
    <externalTexts namespace="mendix.textbox.TextBox">
        <text key="label" />
        <text key="placeholder" />
    </externalTexts>
    <externalTexts namespace="mendix.datagrid.DataGrid" />
</systemProperty>`;

export const systemTextsInput = `<?xml version="1.0" encoding="utf-8"?>
<widget id="mendix.mywidget.MyWidget" needsEntityContext="true" offlineCapable="true" pluginWidget="true"
        xmlns="http://www.mendix.com/widget/1.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.mendix.com/widget/1.0/ ../xsd/widget.xsd">
    <properties>
        <propertyGroup caption="General">
            ${systemProperty}
        </propertyGroup>
    </properties>
</widget>`;

export const systemTextsInputNative = `<?xml version="1.0" encoding="utf-8"?>
<widget id="mendix.mywidget.MyWidget" needsEntityContext="true" offlineCapable="true" pluginWidget="true" supportedPlatform="Native"
        xmlns="http://www.mendix.com/widget/1.0/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.mendix.com/widget/1.0/ ../xsd/widget.xsd">
    <properties>
         <propertyGroup caption="General">
            ${systemProperty}
        </propertyGroup>
    </properties>
</widget>`;
