/**
 *
 */
import _ from 'lodash';

import { onMounted, ref } from '@vue/composition-api';
import { useEventlibCore } from '~/components/eventlib-core'
import { EMouseEvent, MouseHandlerInit } from "~/lib/EventlibHandlers";

import { useImgCanvasOverlays } from '~/components/elem-overlays'

function setup() {
  const overlayRoot = ref(null)

  const eventlibCore = useEventlibCore(overlayRoot);
  const { mousePosRef, loadShapes, setMouseHandlers } = eventlibCore;

  const mouseActivity = ref('<none>');
  const mouseActivity2 = ref('<none>');

  const elemOverlay = useImgCanvasOverlays(overlayRoot);

  function shEvent(e: EMouseEvent) {
    const etype = e.origMouseEvent.type;
    const {x, y} = e.pos;
    mouseActivity.value = `mouse is ${etype}-ing at ${x}, ${y}`;
  }

  function shEvent2(e: EMouseEvent) {
    const etype = e.origMouseEvent.type;
    const {x, y} = e.pos;
    // const ct = e.origMouseEvent.currentTarget
    // const rt = e.origMouseEvent.relatedTarget
    // const t = e.origMouseEvent.target
    mouseActivity2.value = `mouse is ${etype}-ing at ${x}, ${y}`;

  }
  const myHandlers0: MouseHandlerInit = () =>  {
    return {
      mousemove   : e => shEvent(e),
    }
  }

  const myHandlers1: MouseHandlerInit = () =>  {
    return {
      mousedown   : e => shEvent2(e),
      mouseenter  : e => shEvent2(e),
      mouseleave  : e => shEvent2(e),
      mouseout    : e => shEvent2(e),
      mouseover   : e => shEvent2(e),
      mouseup     : e => shEvent2(e),
      click       : e => shEvent2(e),
      dblclick    : e => shEvent2(e),
      contextmenu : e => shEvent2(e),
    }
  }

  onMounted(() => {

    elemOverlay.setDimensions(800, 800);
    setMouseHandlers([myHandlers0, myHandlers1]);

    // const bbox = coords.mk.fromLtwh(20, 40, 200, 444);

    // loadShapes([bbox]);
  });

  return {
    mousePosRef, loadShapes, overlayRoot, mouseActivity, mouseActivity2
  }
}


export default {
  setup
}
