/* global require location watr */

import * as $ from 'jquery';
import * as _ from 'lodash';
const Tree = watr.scalazed.Tree;

/**
 * @returns {string}
 */
export function corpusEntry() {
    let entry = location.href.split('/').reverse()[0].split('?')[0];
    return entry;
}

export function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[[]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


export function IdGenerator() {
    let currId = -1;
    let nextId = () => {
        currId +=1;
        return currId;
    };
    return nextId;
}


export function eventHasLeftClick(event) {
    // buttons: 0=none, 1=left, 3=middle, 2=right
    let b = event.buttons; return b == 1;
}

export function getDescendantTree(rootSelector) {

    function loop($elem) {

        let maybeId = $elem.attr('id');
        let cls = $elem.attr('class');
        let id = maybeId === undefined ? '' : `#${maybeId}`;

        let childs = _.map($elem.children(), function(elemChild) {
            return loop($(elemChild));
        });
        if (childs.length > 0) {
            return Tree.Node(`${id}.${cls}`, childs);
        } else {
            return Tree.Leaf(`${id}.${cls}`);
        }
    }

    return loop($(rootSelector));
}

export function getDescendantTreeString(rootSelector) {
    let desc = getDescendantTree(rootSelector);
    return Tree.drawTree(desc);
}

