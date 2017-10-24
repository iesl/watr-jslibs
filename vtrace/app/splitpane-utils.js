/* global require define $ */

define(['./commons.js'], function (util) {

        // <div id="split-pane-1" class="split-pane fixed-left">
        //     <div class="split-pane-component" id="left-pane">
        //         <div id="left-content" ></div>
        //     </div>
        //     <div class="split-pane-divider" id="lr-divider"></div>
        //     <div class="split-pane-component" id="right-pane">
        //         <div id="right-content" ></div>
        //     </div>
        // </div>

    function mkComponent() {
        return $("<div class='split-pane-component'></div>");
    }
    function mkDivider() {
        return $("<div class='split-pane-divider'></div>");
    }
    function mkSplitPlane() {
        return $("<div class='split-pane'></div>");
    }

    function withFixedLeft(leftWidth) {
        return {
            fixedLeft: true,
            splitAt: leftWidth
        };
    }

    function setWidth(pane, width) {
        let id = $(pane).attr('id');
        let idParts = id.split('_').reverse();
        let parentId = idParts[1];
        let leftId = `#${parentId}_left`;
        let rightId = `#${parentId}_right`;
        let dividerId = `#${parentId}_divider`;

        console.log('id', id);
        console.log('idparts', idParts);
        console.log('l', leftId);
        console.log('r', rightId);

        $(leftId).css({width: width});
        $(rightId).css({left: width});
        $(dividerId).css({left: width});
        $('div.split-pane').splitPane();
    }

    function splitVertical(parentDiv, splitAt) {
        let {splitAt: splitVal} = splitAt;

        let id = $(parentDiv).attr('id');
        let leftId = `${id}_left` ;
        let rightId = `${id}_right` ;
        let dividerId = `${id}_divider` ;
        let lpane = mkComponent()
            .attr('id', leftId)
            .css({width: splitVal})
        ;
        let rpane = mkComponent()
            .attr('id', rightId)
            .css({left: splitVal})
        ;
        let divider = mkDivider()
            .attr('id', dividerId)
            .addClass('v-divider')
            .css({left: splitVal+4, width: 4})
        ;

        $(parentDiv).append(
            mkSplitPlane()
                .addClass('fixed-left')
                .append(lpane, divider, rpane)
        );

        $('div.split-pane').splitPane();

        return {
            left: lpane,
            right: rpane
        };

    }

    return {
        splitVertical: splitVertical,
        withFixedLeft: withFixedLeft,
        setWidth: setWidth
    };

});
