//
/**
  * - pass in div by id to useXX()
  * -
  * - Set mouse handlers
  *   -
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

import {
  ILTBounds,
} from "sharedLib";
import { RTreeIndexable } from '~/lib/TextGlyphDataTypes';




function getCursorPosition(elem: Element, event: MouseEvent) {
  const rect: DOMRect | ClientRect = elem.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return {x, y};
}


export function useEventlibCore<BoxT extends RTreeIndexable>(targetDivRef: Ref<HTMLDivElement>) {

  // class EventRTree<BoxT extends RTreeIndexable> extends RBush<BoxT> {}

  const mousePosRef = reactive({
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

  function loadShapes(shapes: BoxT[]) {
    eventRTree.load(shapes);
  }

  return {
    mousePosRef,
    loadShapes,
    eventRTree,
  }
}
