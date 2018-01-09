/**
 * Some functional helpers building on, or in the style of, lodash.
 **/

/* global _ */

export function zipWithIndex(vs, ibegin) {
    let i = ibegin || 0;
    return _.zip(vs, _.range(i, vs.length+i));
}
