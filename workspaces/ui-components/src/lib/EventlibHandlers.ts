
import * as _ from "lodash";

import {
  Ref,
} from '@vue/composition-api';

import { UnwrapRef } from '@vue/composition-api/dist/reactivity';


type Partial<T> = {
  [P in keyof T]?: T[P];
}

export function getCursorPosition(elem: Element, event: MouseEvent) {
  const rect: DOMRect | ClientRect = elem.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return {x, y};
}

export interface EventlibPoint {
  x: number;
  y: number;
}

export interface EventlibMouse {
  mousePosRef: UnwrapRef<EventlibPoint>;
}

export interface EMouseEvent {
  origMouseEvent: MouseEvent;
  pos: EventlibPoint;
}

export type EMouseEventHandler = (e: EMouseEvent) => void;

interface MouseEventMap {
  mousedown   : EMouseEventHandler;
  mouseenter  : EMouseEventHandler;
  mouseleave  : EMouseEventHandler;
  mousemove   : EMouseEventHandler;
  mouseout    : EMouseEventHandler;
  mouseover   : EMouseEventHandler;
  mouseup     : EMouseEventHandler;
  click       : EMouseEventHandler;
  dblclick    : EMouseEventHandler;
  contextmenu : EMouseEventHandler;
}


const MouseEvents = [
  "mouseover",
  "mouseout",
  "mousemove",
  "mouseup",
  "mousedown",
  "click",
];

export type MouseHandlers = Partial<MouseEventMap>;

export type MouseHandlerInit = (t?: any) => MouseHandlers;

export function setMouseHandlers(
  targetDivRef: Ref<HTMLDivElement>,
  handlers: MouseHandlerInit[]
): void {

  const targetDiv = targetDivRef.value;
  _.each(MouseEvents, eventType => {
    _.each(handlers, (hInit: MouseHandlerInit) => {
      const h: MouseHandlers = hInit(null);
      const eventHandler: ((e: EMouseEvent) => void) = h[eventType];

      if (eventHandler) {
        const adaptor = (e: MouseEvent) => {
          const ev = {
            origMouseEvent: e,
            pos: getCursorPosition(targetDiv, e)
          };
          return eventHandler(ev);
        };

        const addEventListenerOptions: AddEventListenerOptions  = {
          capture: false,
          once: false,
          passive: false
        };

        targetDiv.addEventListener(eventType, adaptor, addEventListenerOptions);
      }
    });
  });
}


// interface KeyEventMap {
//   "keydown": KeyboardEvent;
//   "keypress": KeyboardEvent;
//   "keyup": KeyboardEvent;
// }

// interface OtherEventMap {
//   "drag": DragEvent;
//   "dragend": DragEvent;
//   "dragenter": DragEvent;
//   "dragexit": Event;
//   "dragleave": DragEvent;
//   "dragover": DragEvent;
//   "dragstart": DragEvent;
//   "drop": DragEvent;
//   "select": Event;
//   "selectionchange": Event;
//   "selectstart": Event;
//   "wheel": WheelEvent;
// }
