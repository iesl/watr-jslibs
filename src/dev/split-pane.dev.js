
/* global require $   watr */

import * as spu  from '../client/lib/splitpane-utils.js';
import * as jst  from '../client/lib/jstags.js';

export function runSplitPane() {
    let splitPaneRootId = spu.createSplitPaneRoot("#main");
    const t = jst.t;
    const htm = jst.htm;

    let {topPaneId, bottomPaneId} =
        spu.splitHorizontal(jst.$id(splitPaneRootId), {fixedTop: 40});

    // let Shared = require('./../src/client/lib/shared-state.js');
    $('.split-pane-component').each(function () {
        console.log('this', $(this));

    });

    let buttons = {
        hsplit: htm.iconButton('minus-square-o'),
        vsplit: htm.iconButton('columns')
    };

    // buttons.hsplit.on('click', function() {
    //     let mySplitPane = spu.splitPaneFor(this);

    // });


    let {leftPaneId, rightPaneId} =
        spu.splitVertical(jst.$id(bottomPaneId), {fixedLeft: 200});

    jst.$id(leftPaneId).append(
        t.div('Some Text')
    );


    $('div.split-pane').splitPane();

    let treeStr = spu.getDescendantTreeString("#"+splitPaneRootId);

    jst.$id(rightPaneId).append(
        t.div(t.pre().text(treeStr))
    );

    jst.$id(rightPaneId).append(
        t.span([
            buttons.hsplit, buttons.vsplit
        ])
    );
}
