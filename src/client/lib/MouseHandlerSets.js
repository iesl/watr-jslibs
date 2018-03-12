/**
 *
 */

import * as $ from 'jquery';
import * as _ from 'lodash';
import { $id } from './jstags.js';

export function setMouseHandlers(hArg, targetDivId, handlers) {
    $(targetDivId).off();

    let mouseHandlers = _.map(handlers, handler => {
        let init = {
            mouseover: function() {},
            mouseout: function() {},
            mousemove: function() {},
            mouseup: function() {},
            mousedown: function() {},
            click: function() {}
        };
        Object.assign(init, handler(hArg));
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
