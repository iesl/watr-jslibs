/* global require define $ */

define(['./commons.js', '/js/split-pane.js'], function (util) {

    let exports = {};

    let idSelector = s => `#${s}`;
    let selectId = util.selectId;

    let splitPaneRootId = 'splitpane_root';

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

    exports.setParentPaneWidth = (elem, width) => {
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
    };


    exports.createSplitPaneRoot = (containerId) => {
        $(idSelector(containerId)).append(
            $(`<div id="${splitPaneRootId}"> </div>`)
        );
    };


    exports.createSplitPaneRoot = (containerId) => {
        $(containerId).append(
            $(`<div id="${splitPaneRootId}"> </div>`)
        );
        return splitPaneRootId;
    };

    function getSplitProps(splitProps) {
        return splitProps.fixedLeft ? {splitClass: 'fixed-left', splitAt: splitProps.fixedLeft} :
        splitProps.fixedTop ? {splitClass: 'fixed-top', splitAt: splitProps.fixedTop} :
        {splitClass: 'fixed-top', splitAt: splitProps.fixedTop}
        ;
    }

    exports.splitVertical = (containerSelector, splitProps) => {
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
        let rpane = mkComponent()
            .attr('id', rightId)
            .css({left: splitAt})
        ;
        let divider = mkDivider()
            .attr('id', dividerId)
            .addClass('v-divider')
            .css({left: splitAt+4, width: 4})
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

    };

    exports.splitHorizontal =  (containerSelector, splitProps) => {
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
        let bottomPane = mkComponent()
            .attr('id', bottomId)
            .css({top: splitAt})
        ;
        let divider = mkDivider()
            .attr('id', dividerId)
            .addClass('v-divider')
            .css({top: splitAt+4, height: 4})
        ;


        let split = mkSplitPlane().addClass(splitClass);
        selectId(containerSelector).append(
            composePanes(split, topPane, divider, bottomPane)
        );

        $('div.split-pane').splitPane();

        return {
            topPaneId: topId,
            bottomPaneId: bottomId
        };

    };

    return exports;


});
