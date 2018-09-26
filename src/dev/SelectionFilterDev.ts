
import * as $ from "jquery";
import * as spu from "../client/lib/SplitWin.js";
import { t } from "../client/lib/jstags.js";
import * as SelectionFilter from "../client/lib/SelectionFilter";

export function run()  {
    let rootFrame = spu.createRootFrame("#main");
    rootFrame.setDirection(spu.row);

    let [paneLeft, paneRight] = rootFrame.addPanes(2);


    $(paneLeft.clientAreaSelector()).append(
        t.div(".scrollable-pane", [
            t.div("#tracelog-menu")
        ])
    );

    $.getJSON("/data/tracelog/2", tracelogs => {
        const traceLogs = new SelectionFilter.SelectionFilter(tracelogs);

        const n = traceLogs.getNode();
        $("#tracelog-menu").append(n);
        const rxDisplay = SelectionFilter.displayRx(traceLogs);
        paneRight.clientArea().append(
            rxDisplay
        );
    });

}












