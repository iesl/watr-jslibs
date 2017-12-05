/**
 * A spot for the (hopefully few) application-wide variables
 * Also, setup mouse tracking over named dom elements.
 *
 *  note: event page/client/screen/offset explanations:
 *       https://stackoverflow.com/questions/6073505/what-is-the-difference-between-screenx-y-clientx-y-and-pagex-y
 **/

import * as Rx from 'rxjs/Rx';
import * as coords from './coord-sys.js';


export let shared = {
    TextGridLineSpacing: 16,
    TextGridLineHeight:  16,
    TextGridOriginPt: coords.mkPoint.fromXy(20, 20),

    currentDocument: undefined,

    currMouseClientPt: {x: -1, y: -1},

    dataPts: [],

    documentAnnotations: {},

    annotationLabels: {},

    currentSelections: [],

    rx: {
        selections: new Rx.Subject()
    },

    pageImageRTrees: [],
    pageImageLabelRTrees: [],
    textgridRTrees: []
};

export function setSelections(sels) {
    shared.currentSelections = sels;
    shared.rx.selections.next(sels);
}


export function initGlobalMouseTracking() {
    shared.rx.clientPt = Rx.Observable
        .fromEvent(document, 'mousemove')
        .map(event => {
            let clientPt = coords.mkPoint.fromXy(event.clientX, event.clientY);
            shared.currMouseClientPt = clientPt;
            return clientPt;
        }) ;

}
