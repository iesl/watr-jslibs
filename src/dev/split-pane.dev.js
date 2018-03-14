
/* global require $   watr */

// import * as spu  from '../client/lib/splitpane-utils.js';
import * as spu  from '../client/lib/SplitWin.js';
import * as jst  from '../client/lib/jstags.js';
import * as util from '../client/lib/commons.js';

export function runSplitPane() {
    let splitPaneRootId = spu.createSplitPaneRoot("#main");
    const t = jst.t;
    const htm = jst.htm;

    // let spRoot = spu.mkSplitPaneRoot();

    let ftop = spu.fixedTopProps(90);
    let splitPane = spu.splitHorizontal(splitPaneRootId, 2);

    console.log('splitHorizontal', splitPane);
    console.log('paneId', spu.makePaneId(0));
    console.log('paneId', spu.makePaneId(0, 1));
    console.log('paneId', spu.makePaneId(1, 3, 1));

    // $('.split-pane-component').each(function () {
    //     console.log('this', $(this));
    // });


    // let buttons = {
    //     hsplit: htm.iconButton('minus-square-o'),
    //     vsplit: htm.iconButton('columns')
    // };

    // buttons.hsplit.on('click', function() {
    //     let mySplitPane = spu.splitPaneFor(this);

    // });


    let bottomPaneId = spu.makePaneId(1);
    // let {leftPaneId, rightPaneId} =
    spu.splitVertical(bottomPaneId, 2);

    let leftPaneId = spu.makePaneId(1, 0);
    jst.$id(leftPaneId).append(
        t.div('Some Text')
    );



    let treeStr = util.getDescendantTreeString("#"+splitPaneRootId);

    let rightPaneId = spu.makePaneId(1, 1);
    jst.$id(rightPaneId).append(
        t.div(t.pre().text(treeStr))
    );

    // jst.$id(rightPaneId).append(
    //     t.span([
    //         buttons.hsplit, buttons.vsplit
    //     ])
    // );

}
