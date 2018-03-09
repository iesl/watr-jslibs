/**
 *
 */

import * as $ from 'jquery';
import * as _ from 'lodash';

export function setMouseHandlers(hArg, targetDivId, handlers) {
    $(targetDivId).off();

    // console.log('setMouseHandlers', hArg, targetDivId, handlers);

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
        $(targetDivId).on(eventType, function(event) {
            _.each(mouseHandlers, h => {
                h[eventType](event);
            });
        });
    });
}
