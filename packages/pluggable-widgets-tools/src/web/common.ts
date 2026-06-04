export function parseInlineStyle(style = ""): { [key: string]: string } {
    try {
        return style.split(";").reduce<{ [key: string]: string }>((styleObject, line) => {
            const pair = line.split(":");
            if (pair.length === 2) {
                const name = pair[0].trim().replace(/(-.)/g, match => match[1].toUpperCase());
                styleObject[name] = pair[1].trim();
            }
            return styleObject;
        }, {});
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
        return {};
    }
}
