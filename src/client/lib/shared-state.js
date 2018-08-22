/**
 * A spot for the (hopefully few) application-wide variables
 * Also, setup mouse tracking over named dom elements.
 *
 *  note: event page/client/screen/offset explanations:
 *       https://stackoverflow.com/questions/6073505/what-is-the-difference-between-screenx-y-clientx-y-and-pagex-y
 **/

/* global $ */

import * as Rx from 'rxjs';
import * as coords from './coord-sys.js';


export let shared = {
    TextGridLineHeight:  20,
    TextGridOriginPt: coords.mkPoint.fromXy(20, 20),

    currentDocument: undefined,

    currMouseClientPt: {x: -1, y: -1},

    tooltips: [],

    dataPts: [],

    zones: [],

    curations: [],

    currentSelections: [],

    rx: {
        selections: new Rx.Subject()
    },

    pageImageRTrees: [],
    pageImageLabelRTrees: [],
    textgridRTrees: [],

    pageCount: () => this.pageImageRTrees.length,

    DEV_MODE: false
};

export function setSelections(sels) {
    shared.currentSelections = sels;
    shared.rx.selections.next(sels);
}


export function initGlobalMouseTracking() {
    $(document).on('mousemove', function(event) {
        let clientPt = coords.mkPoint.fromXy(event.clientX, event.clientY);
        shared.currMouseClientPt = clientPt;
    });
    // For some reason this doesn't work in the testing environment, so I use the regular
    //   handler above as well.
    // shared.rx.clientPt = Rx.Observable
    shared.rx.clientPt = Rx.fromEvent(document, 'mousemove')
        .map(event => {
            let clientPt = coords.mkPoint.fromXy(event.clientX, event.clientY);
            shared.currMouseClientPt = clientPt;
            return clientPt;
        }) ;

}
