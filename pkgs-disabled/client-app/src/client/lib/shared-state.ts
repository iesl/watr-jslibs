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
import { mkPoint, Point } from './coord-sys';
import { ReflowWidget } from './ReflowWidget'

class Shared {
  TextGridLineHeight: number = 20;
  TextGridOriginPt = mkPoint.fromXy(20, 20);
  activeReflowWidget?: ReflowWidget;

  currentDocument: string = "";

  clientPt?: rx.Observable<Point>;
  currMouseClientPt?: rx.Observable<Point>;

  tooltips: any[] = [];

  dataPts: any[] = [];

  zones: any[] = [];

  curations: any[] = [];

  currentSelections: any[] = [];

  selections = new rx.Subject()
  // rx = {
  // };

  pageImageRTrees: any[] = [];
  pageImageLabelRTrees: any[] = [];
  textgridRTrees: any[] = [];

  pageCount() { return this.pageImageRTrees.length };

  DEV_MODE: boolean = false;
};

export const shared: Shared = new Shared();

export function setSelections(sels: any[]) {
  shared.currentSelections = sels;
  shared.selections.next(sels);
}


export function initGlobalMouseTracking() {
  // $(document).on('mousemove', function(event) {
  //   let clientPt = mkPoint.fromXy(event.clientX!, event.clientY!);
  //   shared.currMouseClientPt = clientPt;
  // });


  shared.clientPt = rx.fromEvent(document, 'mousemove').pipe(
    rxop.map( (event: Event) => {
      const mevent = event as MouseEvent;
      const clientPt = mkPoint.fromXy(mevent.clientX, mevent.clientY);
      return clientPt;
    })
  );

}
