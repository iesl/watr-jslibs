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
  targetDivRef: Ref<HTMLDivElement>
};

export function useEventlibCore<BoxT extends RTreeIndexable>({
  state,
  targetDivRef
}: Args): EventlibCore {

  const mousePosRef: UnwrapRef<EventlibPoint> = reactive({
    x: 0,
    y: 0
  })

  const eventRTree: RBush<BoxT> = new RBush<BoxT>();

  const handlerQueue: Ref<MouseHandlerInit[]> = ref([]);

  waitFor('EventlibCore', {
    state,
    dependsOn: [targetDivRef],
  }, () => {

    watch(handlerQueue, (handlers) => {
      if (handlers.length > 0) {
        _setMouseHandlers(targetDivRef, handlers);
        handlerQueue.value = [];
      }
    });
  });

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

  // TODO switch to beforeUnmounted ??
  onUnmounted(() => {
    const targetDiv = targetDivRef.value;
    if (targetDiv) {
      targetDivRef.value.removeEventListener('mousemove', onMouseMove);
    }
  })

  function loadShapes(shapes: BoxT[]): void {
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
