/* global require $  _ watr */

import * as Shared from '../client/lib/shared-state';
import * as PageImageWidget from  '../client/lib/PageImageWidget.js';
import { PageImageListWidget, setupPageImages } from '../client/lib/PageImageListWidget.js';
import {ServerDataExchange} from  '../client/lib/ServerDataExchange.js';
import * as rtrees from  '../client/lib/rtrees.js';
import * as coords from '../client/lib/coord-sys';
import * as testdata from './annot-testdata.js';
import * as spu  from '../client/lib/SplitWin.js';
import { t } from '../client/lib/jstags.js';
import * as traceView  from '../client/page/trace-main.js';

export function run()  {
    let rootFrame = spu.createRootFrame("#main");
    rootFrame.setDirection(spu.row);

    let [paneLeft, paneRight] = rootFrame.addPanes(2);

    $(paneLeft.clientAreaSelector()).append(
        t.div('.scrollable-pane', [
            t.div('#tracelog-menu')
        ])
    );

    $.getJSON('/data/tracelog/0', tracelog => {
        traceView.setupTracelogMenu(tracelog);
    });
    // traceView.runMain();

}
