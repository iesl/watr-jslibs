/**
 *
 *
 *    div#splitpane_root.split-pane-component
 *        div.split-pane.fixed-top
 *            div.split-pane-frame
 *                div#root__top.split-pane-component
 *                div#root__divider.split-pane-divider
 *                    div.split-pane-divider-inner
 *                div#root__bottom.split-pane-component
 *
 *    #splitpane_root
 *        .split-pane.fixed-top
 *            .split-pane-frame
 *                #root__top
 *                #root__divider
 *                    .split-pane-divider-inner
 *                #root__bottom
 *
 *
 *
 *
 *    #sp_root.user-content
 *        .pane-layout
 *            .pane-list
 *                .pane#root__0
 *                    .user-content#0
 *                #root__01sep
 *                    .split-pane-divider-inner
 *                .pane#root__1
 *                    .user-content#1
 *
 *
 *
 */

/* global $ watr */
const TB = watr.TextBoxing;

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

    let {splitClass, splitAt} = getSplitProps(splitProps);

    let lpane = mkComponent()
        .attr('id', leftId)
        .css({'min-width': `${splitAt}px`})
    ;
    let divider = mkDivider()
        .attr('id', dividerId)
        .addClass('v-divider')
        .css({left: splitAt, width: defaultDividerWidth, 'min-width': defaultDividerWidth})
    ;
    let rpane = mkComponent()
        .attr('id', rightId)
        .css({left: splitAt+defaultDividerWidth})
    ;

    let split = mkSplitPane()
        .addClass(splitClass)
        .addClass('row')
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
        .addClass(splitClass)
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
