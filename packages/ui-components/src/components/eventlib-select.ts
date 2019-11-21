/**
 * Draw selection rectangles and create selection events
 */
import _ from 'lodash';

import {
  watch,
} from '@vue/composition-api';

// import { DrawToCanvas } from './drawto-canvas';
import { EventlibMouse } from './eventlib-core';



// (drawto, eventlibCore) => eventlibSelect
// export function useEventlibSelect(drawTo: DrawToCanvas, mouseEvents: EventlibMouse) {
export function useEventlibSelect(mouseEvents: EventlibMouse) {

  // const eventlibCore = useEventlibCore<BoxT>(targetDivRef);
  // const { eventRTree } = eventlibCore;

  watch(() => {
    // const pos = eventlibCore.mousePosRef;
  });

  return {
    // eventlibCore,
    // hoveringRef,
  }
}
