/**
 * Helper functions to install/update mouse handlers
 */

import * as _ from "lodash";
import {$id} from "./tstags";

const MOUSE_EVENTS = [
  "mouseover",
  "mouseout",
  "mousemove",
  "mouseup",
  "mousedown",
  "click",
];

interface MouseHandlerSet0 {
  mouseover(event: JQueryMouseEventObject): void;
  mouseout(event: JQueryMouseEventObject): void;
  mousemove(event: JQueryMouseEventObject): void;
  mouseup(event: JQueryMouseEventObject): void;
  mousedown(event: JQueryMouseEventObject): void;
  click(event: JQueryMouseEventObject): void;
}

export interface MouseHandlers {
  mouseover?(event: JQueryMouseEventObject): void;
  mouseout?(event: JQueryMouseEventObject): void;
  mousemove?(event: JQueryMouseEventObject): void;
  mouseup?(event: JQueryMouseEventObject): void;
  mousedown?(event: JQueryMouseEventObject): void;
  click?(event: JQueryMouseEventObject): void;
}

const emptyHandlerSet: MouseHandlerSet = {
  mouseover() {},
  mouseout() {},
  mousemove() {},
  mouseup() {},
  mousedown() {},
  click() {},
};


interface MouseHandlerSet extends MouseHandlerSet0  {
  [K: string]: ((event: JQueryMouseEventObject) => void);
}

export type MouseHandlerInit = (t: any) => MouseHandlers;

export function setMouseHandlers<T>(
  bindThis: T,
  targetDivId: string,
  handlers: MouseHandlerInit[],
) {
  $id(targetDivId).off();

  const mouseHandlers: MouseHandlerSet[] = _.map(handlers, handler => {
    const init: MouseHandlerSet = {
      ...emptyHandlerSet,
      ...handler(bindThis)
    };
    return init;
  });

  _.each(MOUSE_EVENTS, eventType => {
    $id(targetDivId).on(eventType, (event: JQueryMouseEventObject) => {
      _.each(mouseHandlers, (h: MouseHandlerSet) => {
        h[eventType](event);
      });
    });
  });
}


// export function setMouseHandlers(bindThis, targetDivId, handlers) {
//   $id(targetDivId).off();

//   let mouseHandlers = _.map(handlers, handler => {
//     const init = {
//       mouseover: function() {},
//       mouseout: function() {},
//       mousemove: function() {},
//       mouseup: function() {},
//       mousedown: function() {},
//       click: function() {}
//     };
//     Object.assign(init, handler(bindThis));
//     return init;
//   });
//   let events = [
//     'mouseover',
//     'mouseout',
//     'mousemove',
//     'mouseup',
//     'mousedown',
//     'click'
//   ];


//   _.each(events, eventType => {
//     $id(targetDivId).on(eventType, function(event) {
//       _.each(mouseHandlers, h => {
//         h[eventType](event);
//       });
//     });
//   });
// }
