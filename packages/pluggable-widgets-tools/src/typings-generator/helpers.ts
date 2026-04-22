import { Properties, Property, SystemProperty } from "./WidgetXml";

export function extractProperties(props: Properties): Property[] {
    return extractProps(props, p => p.property ?? []);
}

export function extractSystemProperties(props: Properties): SystemProperty[] {
    return extractProps(props, p => p.systemProperty ?? []);
}

function extractProps<P>(props: Properties, extractor: (props: Properties) => P[]): P[] {
    return props.propertyGroup
        ? props.propertyGroup.map(pg => extractProps(pg, extractor)).reduce((a, e) => a.concat(e), [])
        : extractor(props);
}

export function capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export function commasAnd(arr: string[]) {
    return arr.slice(0, -1).join(", ") + (arr.length > 1 ? " and " : "") + arr[arr.length - 1];
}

/**
* Factory method for creating an `Array.reduce()` callback for partitioning the array into groups.
* @example
* ```js
* [1, 4, 3, 13].reduce(groupBy(x => x % 2 ? "odd" : "even")).even // [ 4 ]
* ```
* @param groupSelector Callback that maps array members to their group
* @returns Callback for Array.reduce()
*/
export function groupBy<T, Groups extends string>(groupSelector: (item: T) => Groups) {
    return function reducer(reduction: { [Group in Groups]?: T[] }, item: T): { [Group in Groups]?: T[] } {
        const group = groupSelector(item);
        return { ...reduction, [group]: [...(reduction[group] ?? []), item] }
    }
}
