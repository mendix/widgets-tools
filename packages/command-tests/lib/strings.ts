/***
 * @param element The element to repeat
 * @param amount The amount of times to repeat the element
 * @returns String containing the element amount times.
 */
export function repeat(element: string, amount: number) {
    let result = element;
    while (amount > 0) {
        result += element;
        amount--;
    }
    return result;
}
