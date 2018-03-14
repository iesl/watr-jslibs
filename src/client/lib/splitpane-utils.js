/**
 * Helper utilities for split-pane
 *
 */

/* global $ watr */
// const TB = watr.TextBoxing;
const Tree = watr.scalazed.Tree;

import * as jstags from './jstags.js';
import './split-pane.js';

const t = jstags.t;

const splitPaneRootId = 'splitpane_root';

const defaultDividerWidth = 1;

function mkComponent() {
    return t.div('.split-pane-component');
}

function mkDivider() {
    return t.div('.split-pane-divider');
}

function mkSplitPane() {
    return t.div('.split-pane');
}

function composePanes(split, lpane, divider, rpane) {
    return t.div('.split-pane-frame', [
        split.append(lpane, divider, rpane)
    ]);
}

function makeChildIds(parentId){
    return {
        left: `#${parentId}__left`,
        right: `#${parentId}__right`,
        divider: `#${parentId}__divider`
    };
}

export function setParentPaneWidth (elem, width)  {
    let pane = $(elem).closest('.split-pane-component');
    let id = $(pane).attr('id');
    let idParts = id.split('__');
    idParts.pop();
    let parentId = idParts.join('__');
    let childIds = makeChildIds(parentId);

    $(childIds.left).css({width: width});
    $(childIds.right).css({left: width});
    $(childIds.divider).css({left: width});
    $('div.split-pane').splitPane();
}


export function createSplitPaneRoot (containerId)  {
    $(containerId).append(
        t.div(`#${splitPaneRootId} .split-pane-component`)
    );
    return splitPaneRootId;
}


function getSplitProps(splitProps) {
    return splitProps.fixedLeft ? {splitClass: 'horizontal-percent', splitAt: splitProps.fixedLeft} :
    splitProps.fixedTop ? {splitClass: 'fixed-top', splitAt: splitProps.fixedTop} :
    {splitClass: 'fixed-top', splitAt: splitProps.fixedTop}
    ;
}


export function splitVertical(containerSelector, splitProps) {
    let parentSelection  = $(containerSelector).closest('.split-pane-component');

    let parentId = parentSelection.length > 0 ? $(parentSelection).attr('id') : splitPaneRootId;

    let leftId = `${parentId}__left` ;
    let rightId = `${parentId}__right` ;
    let dividerId = `${parentId}__divider` ;

    // let {splitClass, splitAt} = getSplitProps(splitProps);

    let lpane = mkComponent()
        .attr('id', leftId)
        .css({'min-width': `100px`})
        // .css({'min-width': `${splitAt}px`})
    ;
    let divider = mkDivider()
        .attr('id', dividerId)
        .addClass('v-divider')
        // .css({left: splitAt, width: defaultDividerWidth, 'min-width': defaultDividerWidth})
        .css({width: defaultDividerWidth, 'min-width': defaultDividerWidth})
    ;
    let rpane = mkComponent()
        .attr('id', rightId)
        // .css({left: splitAt+defaultDividerWidth})
    ;

    let split = mkSplitPane()
        .addClass('horizontal-percent')
        // .addClass('row')
    ;

    $(containerSelector).append(
        composePanes(split, lpane, divider, rpane)
    );

    $('div.split-pane').splitPane();

    return {
        leftPaneId: leftId,
        rightPaneId: rightId
    };

}

export function splitHorizontal(containerSelector, splitProps) {
    let parentSelection  = $(containerSelector).closest('.split-pane-component');
    let parentId = parentSelection.length > 0 ? $(parentSelection).attr('id') : splitPaneRootId;

    let topId = `${parentId}__top` ;
    let bottomId = `${parentId}__bottom` ;
    let dividerId = `${parentId}__divider` ;

    let {splitClass, splitAt} = getSplitProps(splitProps);

    let topPane = mkComponent()
        .attr('id', topId)
        .css({'min-height': `${splitAt}px`})
    ;

    let divider = mkDivider()
        .attr('id', dividerId)
        .addClass('h-divider')
        .css({top: splitAt, 'min-height': defaultDividerWidth})
    ;
    let bottomPane = mkComponent()
        .attr('id', bottomId)
        .css({top: splitAt+defaultDividerWidth})
    ;


    let split = mkSplitPane()
        .addClass('horizontal-percent')
        // .addClass(splitClass)
        .addClass('column')
    ;

    $(containerSelector).append(
        composePanes(split, topPane, divider, bottomPane)
    );

    $('div.split-pane').splitPane();

    return {
        topPaneId: topId,
        bottomPaneId: bottomId
    };

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
