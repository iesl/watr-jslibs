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

import {
  // MouseHandlers,
  MouseHandlerInit,
  setMouseHandlers as _setMouseHandlers,
  EventlibPoint,
  getCursorPosition
} from '~/lib/EventlibHandlers';

import { UnwrapRef } from '@vue/composition-api/dist/reactivity';



export interface EventlibCore {
  mousePosRef: UnwrapRef<EventlibPoint>;
  loadShapes: (shapes: RTreeIndexable[]) => void;
  eventRTree: RBush<RTreeIndexable>;
  setMouseHandlers: (hs: MouseHandlerInit[]) => void;
}

export function useEventlibCore<BoxT extends RTreeIndexable>(targetDivRef: Ref<HTMLDivElement>): EventlibCore {

  const mousePosRef: UnwrapRef<EventlibPoint> = reactive({
    x: 0,
    y: 0
  })

  const eventRTree: RBush<BoxT> = new RBush<BoxT>();

  function onMouseMove(e: MouseEvent) {
    const {x, y} = getCursorPosition(targetDivRef.value, e);
    mousePosRef.x = x;
    mousePosRef.y = y;
  }

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

  const setMouseHandlers: (h: MouseHandlerInit[]) => void =
    _.bind(_setMouseHandlers, null, targetDivRef);


  return {
    mousePosRef,
    loadShapes,
    eventRTree,
    setMouseHandlers,
  }
}
