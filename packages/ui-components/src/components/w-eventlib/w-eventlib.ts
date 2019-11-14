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
  ref,
  onMounted,
  onUnmounted,
  // onBeforeMount,
  // onMounted,
  // onBeforeUpdate,
  // onUpdated,
  // onBeforeUnmount,
  // onUnmounted,
  // onErrorCaptured,
  // onActivated,
  // onDeactivated,
} from '@vue/composition-api';

import RBush, { BBox as RBBox } from "rbush";
// import RBushKnn from 'rbush-knn';

import {
  coords,
} from "sharedLib";

function getCursorPosition(elem: Element, event: MouseEvent) {
  const rect: DOMRect | ClientRect = elem.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  return {x, y};
}



class EventRTree<T extends RBBox> extends RBush<T> {
}


export function useWEventLib<BoxT extends RBBox>() {
  const mousePosRef = reactive({
    x: 0,
    y: 0
  })

  const hovered: BoxT[] = [];
  const hoveringRef = ref(hovered);
  let eventDiv: HTMLElement;


  const eventRTree: EventRTree<BoxT> = new EventRTree<BoxT>();

  function onMouseMove(e: MouseEvent) {
    const {x, y} = getCursorPosition(eventDiv, e);
    mousePosRef.x = x;
    mousePosRef.y = y;

    const userPt = coords.mkPoint.fromXy(x, y);

    const queryWidth = 2;
    const queryBoxHeight = 2;
    const queryLeft = userPt.x - queryWidth;
    const queryTop = userPt.y - queryBoxHeight;
    const queryBox = coords.mk.fromLtwh(queryLeft, queryTop, queryWidth, queryBoxHeight);

    const hits: BoxT[] = eventRTree.search(queryBox);
    hovered.splice(0, hovered.length, ...hits);
  }

  function setDiv(eventDivId: string) {
    eventDiv = document.getElementById(eventDivId);
    eventDiv.addEventListener('mousemove', onMouseMove);
  }

  onMounted(() => {
    console.log('onMounted');
  })

  onUnmounted(() => {
    if (eventDiv) {
      eventDiv.removeEventListener('mousemove', onMouseMove);
    }
  })

  function loadShapes(shapes: BoxT[]) {
    eventRTree.load(shapes);
  }

  return {
    mousePosRef,
    loadShapes,
    hoveringRef,
    setDiv,
  }
}

// const watchOptions: WatchOptions = {
//   deep: false,
//   immediate: true
// };
