
// import  * as $ from 'jquery';
/* global $ */
import './split-pane.js';

export let idSelector = s => `#${s}`;

let splitPaneRootId = 'splitpane_root';
let defaultDividerWidth = 1;

function mkComponent() {
    return $("<div class='split-pane-component'></div>");
}
function mkDivider() {
    return $("<div class='split-pane-divider'></div>");
}

function mkSplitPlane() {
    return $("<div class='split-pane'></div>");
}


function composePanes(split, lpane, divider, rpane) {
    let frame = $("<div class='split-pane-frame'></div>");
    // let l = lpane.append($("<div class='pretty-split-pane-component-inner'></div>"));
    // let r = rpane.append($("<div class='pretty-split-pane-component-inner'></div>"));
    return frame.append(
        split.append(lpane, divider, rpane)
    );
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
    // console.log('elem', elem);
    // console.log('pane', pane);
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
        $(`<div id="${splitPaneRootId}" class="split-pane-component"> </div>`)
    );
    return splitPaneRootId;
}

function getSplitProps(splitProps) {
    return splitProps.fixedLeft ? {splitClass: 'fixed-left', splitAt: splitProps.fixedLeft} :
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

    let {splitClass: splitClass, splitAt: splitAt} = getSplitProps(splitProps);

    let lpane = mkComponent()
        .attr('id', leftId)
        .css({width: splitAt})
    ;
    let divider = mkDivider()
        .attr('id', dividerId)
        .addClass('v-divider')
        .css({left: splitAt, width: defaultDividerWidth})
    ;
    let rpane = mkComponent()
        .attr('id', rightId)
        .css({left: splitAt+defaultDividerWidth})
    ;

    let split = mkSplitPlane().addClass(splitClass);

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

    let {splitClass: splitClass, splitAt: splitAt} = getSplitProps(splitProps);

    let topPane = mkComponent()
        .attr('id', topId)
        .css({height: splitAt})
    ;

    let divider = mkDivider()
        .attr('id', dividerId)
        .addClass('h-divider')
        .css({top: splitAt, height: defaultDividerWidth})
    ;
    let bottomPane = mkComponent()
        .attr('id', bottomId)
        .css({top: splitAt+defaultDividerWidth})
    ;


    let split = mkSplitPlane().addClass(splitClass);

    $(containerSelector).append(
        composePanes(split, topPane, divider, bottomPane)
    );

    $('div.split-pane').splitPane();

    return {
        topPaneId: topId,
        bottomPaneId: bottomId
    };

}
