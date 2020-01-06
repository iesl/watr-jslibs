/**
 *
 */
import _ from 'lodash';

import { onMounted, ref } from '@vue/composition-api';
import { useEventlibCore } from '~/components/compositions/eventlib-core'
import { useEventlibSelect } from '~/components/compositions/eventlib-select'
import { useSvgDrawTo } from '~/components/compositions/drawto-canvas';
import { EMouseEvent, MouseHandlerInit } from "~/lib/EventlibHandlers";
import { initState } from '~/components/compositions/component-basics'

import { useSuperimposedElements, ElementTypes } from '~/components/compositions/superimposed-elements'

function setup() {
  const mountPoint = ref(null)
  const containerRef = mountPoint;
  const state = initState();

  const eventlibCore = useEventlibCore({ targetDivRef: mountPoint, state });
  const { setMouseHandlers } = eventlibCore;

  const mouseActivity = ref('<none>');
  const mouseActivity2 = ref('<none>');

  const superimposedElements = useSuperimposedElements({ includeElems: [ElementTypes.Img, ElementTypes.Canvas], mountPoint, state });
  const canvas = superimposedElements.overlayElements.canvas!;

  const svgDrawTo = useSvgDrawTo({ canvas, containerRef, state });
  const eventlibSelect = useEventlibSelect({ eventlibCore, svgDrawTo, state });

  const { selectionRef }  = eventlibSelect;


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

    superimposedElements.setDimensions(600, 500);
    setMouseHandlers([myHandlers1]);

  });

  return {
    mountPoint, mouseActivity, mouseActivity2, selectionRef
  }
}


export default {
  setup
}
