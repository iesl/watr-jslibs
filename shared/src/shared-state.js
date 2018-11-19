/**
 * A spot for the (hopefully few) application-wide variables
 * Also, setup mouse tracking over named dom elements.
 *
 *  note: event page/client/screen/offset explanations:
 *       https://stackoverflow.com/questions/6073505/what-is-the-difference-between-screenx-y-clientx-y-and-pagex-y
 **/
/* global $ */
import * as rx from 'rxjs';
import * as rxop from 'rxjs/operators';
import { mkPoint } from './coord-sys';
class Shared {
    constructor() {
        this.TextGridLineHeight = 20;
        this.TextGridOriginPt = mkPoint.fromXy(20, 20);
        this.currentDocument = "";
        this.tooltips = [];
        this.dataPts = [];
        this.zones = [];
        this.curations = [];
        this.currentSelections = [];
        this.selections = new rx.Subject();
        // rx = {
        // };
        this.pageImageRTrees = [];
        this.pageImageLabelRTrees = [];
        this.textgridRTrees = [];
        this.DEV_MODE = false;
    }
    pageCount() { return this.pageImageRTrees.length; }
    ;
}
;
export const shared = new Shared();
export function setSelections(sels) {
    shared.currentSelections = sels;
    shared.selections.next(sels);
}
export function initGlobalMouseTracking() {
    // $(document).on('mousemove', function(event) {
    //   let clientPt = mkPoint.fromXy(event.clientX!, event.clientY!);
    //   shared.currMouseClientPt = clientPt;
    // });
    shared.clientPt = rx.fromEvent(document, 'mousemove').pipe(rxop.map((event) => {
        const mevent = event;
        const clientPt = mkPoint.fromXy(mevent.clientX, mevent.clientY);
        return clientPt;
    }));
}
//# sourceMappingURL=shared-state.js.map