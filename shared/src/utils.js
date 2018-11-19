/**
 * Various Utility functions
 */
import * as $ from 'jquery';
import * as _ from 'lodash';
/* global require location watr */
export function pp(a) {
    return JSON.stringify(a, undefined, 2);
}
const Tree = watr.scalazed.Tree;
/**
 */
export function corpusEntry() {
    const entry = location.href.split('/').reverse()[0].split('?')[0];
    return entry;
}
export function getParameterByName(name, urlstr) {
    let url = urlstr;
    if (!url)
        url = window.location.href;
    const name0 = name.replace(/[[]]/g, "\\$&");
    const regex = new RegExp(`[?&]${name0}(=([^&#]*)|&|#|$)`);
    const results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
export function newIdGenerator() {
    let currId = -1;
    const nextId = () => {
        currId += 1;
        return currId;
    };
    return nextId;
}
// export function eventHasLeftClick(event: JQueryInputEventObject) {
export function eventHasLeftClick(event) {
    // buttons: 0=none, 1=left, 3=middle, 2=right
    const b = event.buttons;
    return b === 1;
}
export function getDescendantTree(rootSelector) {
    function loop($elem) {
        const maybeId = $elem.attr('id');
        const cls = $elem.attr('class');
        const id = maybeId === undefined ? '' : `#${maybeId}`;
        const childs = _.map($elem.children(), (elemChild) => {
            return loop(elemChild);
        });
        if (childs.length > 0) {
            return Tree.Node(`${id}.${cls}`, childs);
        }
        return Tree.Leaf(`${id}.${cls}`);
    }
    return loop($(rootSelector));
}
export function getDescendantTreeString(rootSelector) {
    const desc = getDescendantTree(rootSelector);
    return Tree.drawTree(desc);
}
//# sourceMappingURL=utils.js.map