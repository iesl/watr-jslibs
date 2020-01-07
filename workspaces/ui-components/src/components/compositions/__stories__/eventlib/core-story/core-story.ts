/**
 *
 */
import _ from 'lodash';

import { onMounted, ref, Ref } from '@vue/composition-api';
import { useEventlibCore } from '~/components/compositions/eventlib-core'
import { useEventlibSelect } from '~/components/compositions/eventlib-select'
import { EMouseEvent, MouseHandlerInit } from "~/lib/EventlibHandlers";
import { initState } from '~/components/compositions/component-basics'

import { useSuperimposedElements, ElementTypes } from '~/components/compositions/superimposed-elements'

function setup() {
  const mountPoint = ref(null)
  const state = initState();

  const eventlibCore = useEventlibCore({ targetDivRef: mountPoint, state });
  const { setMouseHandlers } = eventlibCore;

  const mouseActivity = ref('<none>');
  const mouseActivityLog = ref(['<none>']);

  const superimposedElements = useSuperimposedElements({ includeElems: [ElementTypes.Img, ElementTypes.Svg], mountPoint, state });

  const eventlibSelect = useEventlibSelect({ eventlibCore, superimposedElements, state });

  const { selectionRef }  = eventlibSelect;


  function showMouseEvent(e: EMouseEvent) {
    const etype = e.origMouseEvent.type;
    const {x, y} = e.pos;
    const xi = x.toFixed(2);
    const yi = y.toFixed(2);
    const log = `Mouse: ${etype} @${xi},  ${yi}`;
    if (etype === 'mousemove') {
      mouseActivity.value = `Mouse move: @${xi},  ${yi}`;
    } else {
      const logs = mouseActivityLog.value;
      const newLogs = logs.slice(0, 5);
      newLogs.unshift(log);
      mouseActivityLog.value = newLogs;
    }
  }

  const myHandlers1: MouseHandlerInit = () =>  {
    return {
      mousemove   : e => showMouseEvent(e),
      mousedown   : e => showMouseEvent(e),
      mouseenter  : e => showMouseEvent(e),
      mouseleave  : e => showMouseEvent(e),
      mouseout    : e => showMouseEvent(e),
      mouseover   : e => showMouseEvent(e),
      mouseup     : e => showMouseEvent(e),
      click       : e => showMouseEvent(e),
      dblclick    : e => showMouseEvent(e),
      contextmenu : e => showMouseEvent(e),
    }
  }

  onMounted(() => {

    superimposedElements.setDimensions(600, 500);
    setMouseHandlers([myHandlers1]);

  });

  return {
    mountPoint, mouseActivity, selectionRef, mouseActivityLog
  }
}


export default {
  setup
}
