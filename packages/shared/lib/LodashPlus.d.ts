/**
 * Some functional helpers building on, or in the style of, lodash.
 */
export declare function zipWithIndex(vs: any[], ibegin?: number): [any, number | undefined][];
export declare function sortedUniqCount<T>(array: T[]): [T, number][];
/**
 *
 * @returns {Array} Returns the new duplicate free array.
 * @example
 *
 * sortedUniqCountBy([1.1, 1.2, 2.3, 2.4], Math.floor)
 * // => [[1.1, 2], [2.3, 2]]
 */
export declare function sortedUniqCountBy<T, U>(array: T[], iteratee?: (t: T) => U): [T, number][];
