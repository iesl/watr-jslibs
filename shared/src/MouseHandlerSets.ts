/**
 * Helper functions to install/update mouse handlers
 */

import * as $ from 'jquery';
import * as _ from 'lodash';
import { $id } from "./tstags";

export function setMouseHandlers(bindThis, targetDivId, handlers) {
    $id(targetDivId).off();

    let mouseHandlers = _.map(handlers, handler => {
        const init = {
            mouseover: function() {},
            mouseout: function() {},
            mousemove: function() {},
            mouseup: function() {},
            mousedown: function() {},
            click: function() {}
        };
        Object.assign(init, handler(bindThis));
        return init;
    });
    let events = [
        'mouseover',
        'mouseout',
        'mousemove',
        'mouseup',
        'mousedown',
        'click'
    ];


    _.each(events, eventType => {
        $id(targetDivId).on(eventType, function(event) {
            _.each(mouseHandlers, h => {
                h[eventType](event);
            });
        });
    });
}
