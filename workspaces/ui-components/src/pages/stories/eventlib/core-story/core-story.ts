/**
 *
 */
import _ from 'lodash';

import { onMounted, ref, watch } from '@vue/composition-api';
import { useEventlibCore } from '~/components/compositions/eventlib-core'
import { useEventlibSelect } from '~/components/compositions/eventlib-select'
import { useCanvasDrawto } from '~/components/compositions/drawto-canvas';
import { EMouseEvent, MouseHandlerInit } from "~/lib/EventlibHandlers";
import { initState } from '~/components/compositions/component-basics'

import { useImgCanvasOverlays } from '~/components/compositions/elem-overlays'

function setup() {
  const mountPoint = ref(null)
  const containerRef = mountPoint;
  const state = initState();

  const eventlibCore = useEventlibCore({ targetDivRef: mountPoint, state });
  const { setMouseHandlers } = eventlibCore;

  const mouseActivity = ref('<none>');
  const mouseActivity2 = ref('<none>');

  const elemOverlay = useImgCanvasOverlays({ mountPoint, state });
  const canvasRef = elemOverlay.elems.canvasElem;

  const canvasDrawto = useCanvasDrawto({ canvasRef, containerRef, state });
  const eventlibSelect = useEventlibSelect({ eventlibCore, canvasDrawto, state });

  const { selectionRef }  = eventlibSelect;

  watch(canvasRef, (el) => {
    if (el === null) return;
  });


  function shEvent(e: EMouseEvent) {
    const etype = e.origMouseEvent.type;
    const {x, y} = e.pos;
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    mouseActivity.value = `mouse ${etype} @${xi},${yi}`;
  }

  function shEvent2(e: EMouseEvent) {
    const etype = e.origMouseEvent.type;
    const {x, y} = e.pos;
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    mouseActivity2.value = `mouse ${etype} @${xi}, ${yi}`;

  }

  const myHandlers1: MouseHandlerInit = () =>  {
    return {
      mousemove   : e => shEvent(e),
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

    elemOverlay.setDimensions(600, 500);
    setMouseHandlers([myHandlers1]);

  });

  return {
    mountPoint, mouseActivity, mouseActivity2, selectionRef
  }
}


export default {
  setup
}
