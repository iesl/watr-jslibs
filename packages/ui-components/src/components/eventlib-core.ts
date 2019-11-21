/**
  */
import _ from 'lodash';

import {
  reactive,
  onMounted,
  onUnmounted,
  Ref,
  watch,
} from '@vue/composition-api';

import RBush, {} from "rbush";

import { RTreeIndexable } from '~/lib/TextGlyphDataTypes';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';


function getCursorPosition(elem: Element, event: MouseEvent) {
  const rect: DOMRect | ClientRect = elem.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return {x, y};
}


// export interface EventlibCore {
//   mousePosRef: UnwrapRef<Point>;
//   loadShapes: (shapes: T[]) => void;
//   eventRTree: RBush<T>;
// }

interface Point {
  x: number;
  y: number;
}

export interface EventlibMouse {
  mousePosRef: UnwrapRef<Point>;
}

export interface MouseHandlers {
  mouseover?(event: MouseEvent): void;
  mouseout?(event: MouseEvent): void;
  mousemove?(event: MouseEvent): void;
  mouseup?(event: MouseEvent): void;
  mousedown?(event: MouseEvent): void;
  click?(event: MouseEvent): void;
}

export function useEventlibCore<BoxT extends RTreeIndexable>(targetDivRef: Ref<HTMLDivElement>)  {

  const mousePosRef: UnwrapRef<Point> = reactive({
    x: 0,
    y: 0
  })

  const eventRTree: RBush<BoxT> = new RBush<BoxT>();

  function addMouseHandlers(h: MouseHandlers): void {

  }

  function onMouseMove(e: MouseEvent) {
    const {x, y} = getCursorPosition(targetDivRef.value, e);
    mousePosRef.x = x;
    mousePosRef.y = y;
  }
  // "mousedown": MouseEvent;
  // "mouseenter": MouseEvent;
  // "mouseleave": MouseEvent;
  // "mousemove": MouseEvent;
  // "mouseout": MouseEvent;
  // "mouseover": MouseEvent;
  // "mouseup": MouseEvent;


  onMounted(() => {
    watch(targetDivRef, (targetDiv) => {
      if (targetDiv) {
        targetDivRef.value.addEventListener('mousemove', onMouseMove);
      }
    })
  })

  onUnmounted(() => {
    const targetDiv = targetDivRef.value;
    if (targetDiv) {
      targetDivRef.value.removeEventListener('mousemove', onMouseMove);
    }
  })

  function loadShapes(shapes: BoxT[]): void {
    eventRTree.load(shapes);
  }

  return {
    mousePosRef,
    loadShapes,
    eventRTree,
  }
}
