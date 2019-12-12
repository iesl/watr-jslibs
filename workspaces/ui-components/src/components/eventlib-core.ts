/**
  */
import _ from 'lodash';

import {
  reactive,
  onMounted,
  onUnmounted,
  Ref,
  ref,
  watch,
  // onTrigger,
  // onTrack,
} from '@vue/composition-api';

import RBush, {} from "rbush";

import { RTreeIndexable } from '~/lib/TextGlyphDataTypes';
import { StateArgs, waitFor } from '~/components/component-basics'

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

type Args = StateArgs & {
  targetDivRef: Ref<HTMLDivElement|null>
};

export function useEventlibCore({
  state,
  targetDivRef
}: Args): EventlibCore {

  const mousePosRef: UnwrapRef<EventlibPoint> = reactive({
    x: 0,
    y: 0
  })

  const eventRTree: RBush<RTreeIndexable> = new RBush<RTreeIndexable>();

  const handlerQueue: Ref<MouseHandlerInit[]> = ref([]);

  waitFor('EventlibCore', {
    state,
    dependsOn: [targetDivRef],
  }, () => {

    const targetDiv = targetDivRef.value!;
    targetDiv.addEventListener('mousemove', onMouseMove);

    watch(handlerQueue, (handlers) => {
      if (handlers.length > 0) {
        _setMouseHandlers(targetDivRef, handlers);
        handlerQueue.value = [];
      }
    });
  });

  function onMouseMove(e: MouseEvent) {
    const targetDiv = targetDivRef.value;
    if (targetDiv) {
      const {x, y} = getCursorPosition(targetDiv, e);
      mousePosRef.x = x;
      mousePosRef.y = y;
    }
  }

  // TODO switch to beforeUnmounted ??
  onUnmounted(() => {
    const targetDiv = targetDivRef.value;
    if (targetDiv) {
      targetDiv.removeEventListener('mousemove', onMouseMove);
    }
  })


  function loadShapes(shapes: RTreeIndexable[]): void {
    eventRTree.load(shapes);
  }


  function setMouseHandlers(h: MouseHandlerInit[]): void {
    const current = handlerQueue.value;
    handlerQueue.value = _.concat(current, h);

    // console.log('eventlibCore: setMouseHandlers; h', h);
    // _.bind(_setMouseHandlers, null, targetDivRef);
  }


  return {
    mousePosRef,
    loadShapes,
    eventRTree,
    setMouseHandlers,
  }
}
