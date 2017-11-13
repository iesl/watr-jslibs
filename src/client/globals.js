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

    currentSelections: []
};


function updateMouseStatus() {
    let x = globals.currMouseClientPt.x;
    let y = globals.currMouseClientPt.y;
    $("li > span#mousepos").text(
        `x: ${x}, y: ${y}`
    );

}

export function initGlobalMouseTracking() {

    $(document).on('mousemove', function(event) {
        globals.currMouseClientPt.x = event.pageX;
        globals.currMouseClientPt.y = event.pageY;

        updateMouseStatus();
    });

}
