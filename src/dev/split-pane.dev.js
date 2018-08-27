/* global require */

import * as spu  from '../client/lib/SplitWin';
import * as util  from '../client/lib/commons';
import * as _ from 'lodash';
import { $id, t, htm } from '../client/lib//jstags.js';

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
            const paneSelector = `#${p2.frameId}`;
            let treeStr = util.getDescendantTreeString(paneSelector);
            p2.clientArea().append(
                t.div([t.pre().text(treeStr)])
            );
        });
    });





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
