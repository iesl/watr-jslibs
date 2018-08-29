
import * as $ from 'jquery';
import * as spu  from '../client/lib/SplitWin.js';
import { t } from '../client/lib/jstags.js';
import * as TraceLogs from '../client/lib/TraceLogs';

export function run()  {
    let rootFrame = spu.createRootFrame("#main");
    rootFrame.setDirection(spu.row);

    let [paneLeft, paneRight] = rootFrame.addPanes(2);


    $(paneLeft.clientAreaSelector()).append(
        t.div('.scrollable-pane', [
            t.div('#tracelog-menu')
        ])
    );

    $.getJSON('/data/tracelog/1', tracelogs => {
        const traceLogs = new TraceLogs.TraceLogs(tracelogs);

        const n = traceLogs.getNode();
        $("#tracelog-menu").append(n);
        const rxDisplay = TraceLogs.displayRx(traceLogs);
        paneRight.clientArea().append(
            rxDisplay
        );
    });

}












