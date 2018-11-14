"use strict";
/**
 * Various Utility functions
 */
exports.__esModule = true;
var $ = require("jquery");
var _ = require("lodash");
/* global require location watr */
function pp(a) {
    return JSON.stringify(a, undefined, 2);
}
exports.pp = pp;
var Tree = watr.scalazed.Tree;
/**
 */
function corpusEntry() {
    var entry = location.href.split('/').reverse()[0].split('?')[0];
    return entry;
}
exports.corpusEntry = corpusEntry;
function getParameterByName(name, urlstr) {
    var url = urlstr;
    if (!url)
        url = window.location.href;
    var name0 = name.replace(/[[]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name0 + "(=([^&#]*)|&|#|$)");
    var results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
exports.getParameterByName = getParameterByName;
function newIdGenerator() {
    var currId = -1;
    var nextId = function () {
        currId += 1;
        return currId;
    };
    return nextId;
}
exports.newIdGenerator = newIdGenerator;
// export function eventHasLeftClick(event: JQueryInputEventObject) {
function eventHasLeftClick(event) {
    // buttons: 0=none, 1=left, 3=middle, 2=right
    var b = event.buttons;
    return b === 1;
}
exports.eventHasLeftClick = eventHasLeftClick;
function getDescendantTree(rootSelector) {
    function loop($elem) {
        var maybeId = $elem.attr('id');
        var cls = $elem.attr('class');
        var id = maybeId === undefined ? '' : "#" + maybeId;
        var childs = _.map($elem.children(), function (elemChild) {
            return loop(elemChild);
        });
        if (childs.length > 0) {
            return Tree.Node(id + "." + cls, childs);
        }
        return Tree.Leaf(id + "." + cls);
    }
    return loop($(rootSelector));
}
exports.getDescendantTree = getDescendantTree;
function getDescendantTreeString(rootSelector) {
    var desc = getDescendantTree(rootSelector);
    return Tree.drawTree(desc);
}
exports.getDescendantTreeString = getDescendantTreeString;
