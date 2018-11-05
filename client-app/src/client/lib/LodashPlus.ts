/**
 * Some functional helpers building on, or in the style of, lodash.
 */

import * as _ from "lodash";

export function zipWithIndex(vs: any[], ibegin = 0) {
    return _.zip(vs, _.range(ibegin, vs.length+i));
}


export function sortedUniqCount<T>(array: T[]): Array<[T, number]> {
    return sortedUniqCountBy(array);
}

/**
 *
 * @returns {Array} Returns the new duplicate free array.
 * @example
 *
 * sortedUniqCountBy([1.1, 1.2, 2.3, 2.4], Math.floor)
 * // => [[1.1, 2], [2.3, 2]]
 */
export function sortedUniqCountBy<T, U>(array: T[], iteratee?: (t: T) => U): Array<[T, number]> {
    return (array != null && array.length)
        ? baseSortedUniqCount(array, iteratee)
        : [];
}


/**
 *
 */
function baseSortedUniqCount<T, U>(array: T[], iteratee?: (t: T) => U): Array<[T, number]> {
    let seen: T | U | undefined;
    let index = -1;
    let resIndex = 0;

    const { length } = array;
    const result: Array<[T, number]> = [];

    while (++index < length) {
        const value = array[index];
        const computed = iteratee ? iteratee(value) : value;

        if (!index || !_.eq(computed, seen)) {
            seen = computed;
            result[resIndex++] = [value, 1];
        } else {
            ++result[resIndex-1][1];
        }
    }
    return result;
}
