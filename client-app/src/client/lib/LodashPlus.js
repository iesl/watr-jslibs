"use strict";
/**
 * Some functional helpers building on, or in the style of, lodash.
 */
exports.__esModule = true;
var _ = require("lodash");
function zipWithIndex(vs, ibegin) {
    if (ibegin === void 0) { ibegin = 0; }
    return _.zip(vs, _.range(ibegin, vs.length + ibegin));
}
exports.zipWithIndex = zipWithIndex;
function sortedUniqCount(array) {
    return sortedUniqCountBy(array);
}
exports.sortedUniqCount = sortedUniqCount;
/**
 *
 * @returns {Array} Returns the new duplicate free array.
 * @example
 *
 * sortedUniqCountBy([1.1, 1.2, 2.3, 2.4], Math.floor)
 * // => [[1.1, 2], [2.3, 2]]
 */
function sortedUniqCountBy(array, iteratee) {
    return (array !== null && array.length)
        ? baseSortedUniqCount(array, iteratee)
        : [];
}
exports.sortedUniqCountBy = sortedUniqCountBy;
/**
 * TODO test me after refactor
 */
function baseSortedUniqCount(array, iteratee) {
    var seen;
    var index = 0;
    var resIndex = 0;
    var length = array.length;
    var result = [];
    while (index < length) {
        var value = array[index];
        var computed = iteratee ? iteratee(value) : value;
        if (!index || !_.eq(computed, seen)) {
            seen = computed;
            result[resIndex] = [value, 1];
            resIndex += 1;
        }
        else {
            result[resIndex - 1][1] += 1;
        }
        index += 1;
    }
    return result;
}
