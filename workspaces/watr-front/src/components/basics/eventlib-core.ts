/**
  */
import _ from 'lodash';

import {
  reactive,
  onUnmounted,
  Ref,
  ref,
  watch,
  // onTrigger,
  // onTrack,
} from '@vue/composition-api';

import RBush, {} from "rbush";

import { RTreeIndexable } from '~/lib/TextGlyphDataTypes';
import { StateArgs, waitFor } from '~/components/basics/component-basics'

import {
  // MouseHandlers,
  MouseHandlerInit,
  setMouseHandlers as _setMouseHandlers,
  EventlibPoint,
  getCursorPosition,
  EMouseEvent
} from '~/lib/EventlibHandlers';

import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import * as coords from '~/lib/coord-sys';



export interface EventlibCore {
  mousePosRef: UnwrapRef<EventlibPoint>;
  loadShapes: (shapes: RTreeIndexable[]) => void;
  eventRTree: RBush<RTreeIndexable>;
  setMouseHandlers: (hs: MouseHandlerInit[]) => void;
}

type Args = StateArgs & {
  targetDivRef: Ref<HTMLDivElement|null>;
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

  // const hoverHandlers: MouseHandlerInit = () =>  {
  //   const mousemove = (e: EMouseEvent) => {
  //     const pos = e.pos;
  //     const mousePt = coords.mkPoint.fromXy(pos.x, pos.y);
  //     const queryBox = coords.boxCenteredAt(mousePt, 1, 1);
  //     const hits = eventRTree.search(queryBox);
  //     _.each(hits, (q) => {
  //     });
  //   }

  //   return {
  //     mousemove,
  //   }
  // }


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

  // // TODO switch onUnmounted to beforeUnmounted ??
  // onUnmounted(() => {
  //   const targetDiv = targetDivRef.value;
  //   if (targetDiv) {
  //     targetDiv.removeEventListener('mousemove', onMouseMove);
  //   }
  // })

  // function addShape(shape: RTreeIndexable): void {
  //   eventRTree.insert(shape);
  // }

  function loadShapes(shapes: RTreeIndexable[]): void {
    eventRTree.load(shapes);
  }


  function setMouseHandlers(h: MouseHandlerInit[]): void {
    const current = handlerQueue.value;
    handlerQueue.value = _.concat(current, h);
  }


  return {
    mousePosRef,
    loadShapes,
    eventRTree,
    setMouseHandlers,
  }
}
