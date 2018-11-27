/**
 * Helper functions to install/update mouse handlers
 */

import _ from "lodash";
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

interface MouseHandlerSet extends MouseHandlerSet0 {
  [K: string]: ((event: JQueryMouseEventObject) => void);
}

type MouseHandlerInit = (t: any) => MouseHandlerSet;

export function setMouseHandlers<T>(
  bindThis: T,
  targetDivId: string,
  handlers: MouseHandlerInit[],
) {
  $id(targetDivId).off();

  const mouseHandlers: MouseHandlerSet[] = _.map(handlers, handler => {
    const init: MouseHandlerSet = {
      mouseover() {},
      mouseout() {},
      mousemove() {},
      mouseup() {},
      mousedown() {},
      click() {},
    };
    Object.assign(init, handler(bindThis));
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
