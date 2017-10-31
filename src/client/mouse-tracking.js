/**
 * Setup mouse tracking over named dom elements.
 *
 *  note: event page/client/screen/offset explanations:
 *       https://stackoverflow.com/questions/6073505/what-is-the-difference-between-screenx-y-clientx-y-and-pagex-y
 **/

import * as $ from 'jquery';
import * as _ from 'underscore';
import {globals} from './globals';


function updateMouseStatus() {
    let x = globals.currentMousePos.x;
    let y = globals.currentMousePos.y;
    $("li > span#mousepos").text(
        `x: ${x}, y: ${y}`
    );

}

export function initGlobalMouseTracking(elemIds) {
    // let locs = {};
    // _.each(elemIds, (elemId) =>{
    //     // Constantly track the mouse location
    //     $(elemId).mousemove(function(event) {
    //         locs[elemId] = {
    //             pageLoc: [event.pageX, event.pageY],
    //             clientLoc: [event.clientX, event.clientY]
    //         };

    //     });

    // });

    $(document).on('mousemove', function(event) {
        globals.currentMousePos.x = event.pageX;
        globals.currentMousePos.y = event.pageY;

        // let info = _.map(_.pairs(locs), ([elemId, loc]) => {
        //     return `${elemId}: ${loc.pageLoc}`;
        // }).join("; ");


        updateMouseStatus();
    });

}
