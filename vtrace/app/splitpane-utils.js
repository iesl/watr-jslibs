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

    function atFixedLeft(leftWidth) {
        return {
            fixedLeft: true ,
            splitAt: leftWidth
        };
    }

    function splitVertical(parentDiv, splitAt) {
        let {splitAt: splitVal}= splitAt;

        let id = $(parentDiv).attr('id');
        let leftId = `${id}_left` ;
        let rightId = `${id}_right` ;
        let lpane = mkComponent()
            .attr('id', leftId)
            .css({width: splitVal})
        ;
        let rpane = mkComponent()
            .attr('id', rightId)
            .css({left: splitVal})
        ;
        let divider = mkDivider()
            .addClass('v-divider')
            .css({left: splitVal, width: 5})
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
        atFixedLeft: atFixedLeft

    };

});
