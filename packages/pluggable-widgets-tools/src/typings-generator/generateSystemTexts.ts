import { ensure } from "../common";
import { capitalizeFirstLetter, lowercaseFirstLetter, templateInterface } from "./helpers";
import { SystemProperty, TextSystemProperty } from "./WidgetXml";

const STAR = "*" as const;
type Star = typeof STAR;
type Text = { key: string; parameters: string[] } | { namespace: string; key: Star | string[] };

function textsFromSystemProperty(node: SystemProperty): Text[] {
    if (!isTextSystemProperty(node)) return [];

    return [
        ...(node.text ?? []).map(t => ({
            key: t.$.key,
            parameters: (t.parameters ?? []).flatMap(pp => (pp.parameter ?? []).map(p => p.$.caption))
        })),
        ...(node.externalTexts ?? []).map(e => {
            return {
                namespace: e.$.namespace,
                key: e.text === undefined ? STAR : e.text.map(t => t.$.key)
            };
        })
    ];
}

function isTextSystemProperty(node: SystemProperty): node is TextSystemProperty {
    return node.$.key === "Text";
}

function generateTextType(t: Text): string {
    if ("namespace" in t) {
        if (t.key === STAR) {
            return `"${t.namespace}": [key: string, params?: string[]]`;
        }
        return `"${t.namespace}": [key: ${t.key.map(key => `"${key}"`).join(" | ")}, params?: string[]]`;
    }

    const parameterTypes = t.parameters.map(p => `${normalizeParameterName(p)}: string`);
    const propertyType = parameterTypes.length > 0 ? `[params: [${parameterTypes.join(", ")}]]` : "[]";
    return `"${t.key}": ${propertyType};`;
}

/***
 * Normalize parameter captions to be legal Javascript function parameter names.
 * @example
 * // returns amountEUR
 * normalizeParameterName("Amount (EUR)")
 */
function normalizeParameterName(name: string) {
    const elements = ensure(name.match(/\w+/g));
    return lowercaseFirstLetter(elements.map(el => capitalizeFirstLetter(el)).join(""));
}

export function generateTranslations(systemProperties: SystemProperty[]): string {
    const texts = systemProperties.flatMap(textsFromSystemProperty);

    if (texts.length === 0) {
        return "";
    }

    return templateInterface("Translations", ...texts.map(generateTextType));
}

export const systemTextsProperty = `texts: {
    translate: <K extends keyof Translations>(key: K, ...params: Translations[K]) => string
}`;
