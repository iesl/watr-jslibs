/* global require */

import * as spu  from '../client/lib/SplitWin.js';
import * as _ from 'lodash';

export function runSplitPane() {
    let rootFrame = spu.createRootFrame("#main");
    rootFrame.setDirection(spu.col);
    // rootFrame.setDirection(spu.row);

    rootFrame.addPanes(4);
    let panes1 = rootFrame.getChildren();

    _.each(panes1, (p, i) => {
        p.addPaneControls();
        p.setDirection(spu.row);
        p.addPanes(i + 2);
        _.each(p.getChildren(), (p2, i2) => {
            p2.addPaneControls();
            // p2.setToColumn();
            // p2.addPanes(i2 + 1);
        });
    });




    // let treeStr = util.getDescendantTreeString("#"+splitPaneRootId);

    // let rightPaneId = spu.makePaneId(1, 1);
    // jst.$id(rightPaneId).append(
    //     t.div(t.pre().text(treeStr))
    // );

    // jst.$id(rightPaneId).append(
    //     t.span([
    //         buttons.hsplit, buttons.vsplit
    //     ])
    // );

}
