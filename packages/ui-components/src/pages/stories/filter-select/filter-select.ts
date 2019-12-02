import { SelectionFilteringEngine, CandidateGroup } from "~/lib/FilterEngine";
import { candidateGroup, candidateGroupF, ILogEntry } from '~/lib/dev-helpers';
import { useEventlibCore } from '~/components/eventlib-core';
import { ref, watch } from '@vue/composition-api';
import { useEventlibSelect } from '~/components/eventlib-select';
import { useCanvasDrawto } from '~/components/drawto-canvas';
import { useImgCanvasOverlays } from '~/components/elem-overlays';

import { configRequest, configAxios } from '~/lib/axios';


function createFilter(cgs: CandidateGroup[]) {
  return new SelectionFilteringEngine(cgs);
}


function setup() {
  const overlayRoot = ref(null)

  const eventlibCore = useEventlibCore(overlayRoot);
  // const { setMouseHandlers } = eventlibCore;

  configAxios().get('/tracelogs/tracelog.json')
    .then(tracelogJson => {
      console.log('log', log);

      const groups: CandidateGroup = {
        candidates: tracelogJson,
        groupKeyFunc: (l: ILogEntry) => ({ multikey: ["trace", `p${l.page+1}. ${l.headers.callSite} ${l.headers.tags}`], displayTitle: "todo" })
      };

      return groups;

    });


  const cs1 = candidateGroup('foo', 'alex');
  // const cs2 = candidateGroup('bar', 'blob');
  // // const cs3 = candidateGroup("foo", "alex");
  console.log('cs1', cs1);


  // const g1 = candidateGroupF('foo', 'alex', g => ({ multikey: ['foo', g.page.toString()], displayTitle: '??' }));
  // const g2 = candidateGroupF('foo', 'greg', g => ({ multikey: ['foo', g.page.toString()], displayTitle: '??' }));
  // const g3 = candidateGroupF('bar', 'greg', g => ({ multikey: ['bar', g.page.toString()], displayTitle: '??' }));

  // const mouseActivity = ref('<none>');
  // const mouseActivity2 = ref('<none>');

  // const elemOverlay = useImgCanvasOverlays(overlayRoot);
  // const canvasElemRef = elemOverlay.elems.canvasElem;

  // const drawTo = useCanvasDrawto(canvasElemRef, overlayRoot);
  // const eventlibSelect = useEventlibSelect(eventlibCore, drawTo);

  // const { selectionRef }  = eventlibSelect;

  // watch(canvasElemRef, (el) => {
  //   if (el === null) return;
  // });



  return {
    overlayRoot,
    // mouseActivity, mouseActivity2, selectionRef
  }
}

export default {
  setup
}
