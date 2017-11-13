/**
 * A spot for the (hopefully few) application-wide variables
 * Also, setup mouse tracking over named dom elements.
 *
 *  note: event page/client/screen/offset explanations:
 *       https://stackoverflow.com/questions/6073505/what-is-the-difference-between-screenx-y-clientx-y-and-pagex-y
 **/

import * as $ from 'jquery';
import * as _ from 'lodash';

export let globals = {

    currentDocument: undefined,

    currMouseClientPt: {x: -1, y: -1},

    dataPts: [],

    documentAnnotations: {},

    annotationLabels: {},

    currentSelections: [],

    rx: {}

};


function updateMouseStatus() {
    let x = globals.currMouseClientPt.x;
    let y = globals.currMouseClientPt.y;
    $("li > span#mousepos").text(
        `x: ${x}, y: ${y}`
    );

}

import Rx from 'rxjs/Rx';
import * as coords from './coord-sys.js';

export function initGlobalMouseTracking() {
    // var button = document.querySelector('button');
    globals.rx.clientPt = Rx.Observable
        .fromEvent(document, 'mousemove')
        .map(event => {return coords.mkPoint.fromXy(event.clientX, event.clientY); })
    ;
        // .throttleTime(1000)
        // .map(event => event.clientX)
        // .scan((count, clientX) => count + clientX, 0)
        // .subscribe(count => console.log(count));

    $(document).on('mousemove', function(event) {
        globals.currMouseClientPt.x = event.pageX;
        globals.currMouseClientPt.y = event.pageY;

        updateMouseStatus();
    });

}
