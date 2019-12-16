
import {
  ref,
  Ref,
  onMounted,
} from '@vue/composition-api';


import { useImgCanvasOverlays } from '~/components/compositions/elem-overlays'
import { useCanvasDrawto } from '~/components/compositions/drawto-canvas';
import { useSketchlibCore } from '~/components/compositions/sketchlib-core';
import { useEventlibCore } from '~/components/compositions/eventlib-core';
import { useEventlibSelect } from '~/components/compositions/eventlib-select'
import { initState, waitFor } from '~/components/compositions/component-basics'

export default {
  setup() {

    const state = initState();

    // waitFor rationale:
    const mountPoint: Ref<HTMLDivElement|null> = ref(null);
    const containerRef = mountPoint;
    const eventlibCore = useEventlibCore({ targetDivRef: mountPoint, state } );

    const elemOverlay = useImgCanvasOverlays({ mountPoint, state });

    const canvasRef = elemOverlay.elems.canvasElem

    const canvasDrawto = useCanvasDrawto({ canvasRef, containerRef, state });
    const eventlibSelect = useEventlibSelect({ eventlibCore, canvasDrawto, state });

    useSketchlibCore({ state, canvasDrawto, eventlibCore, eventlibSelect });


    onMounted(() => {

      waitFor('SketchlibCoreStory', { state }, () => {
        elemOverlay.setDimensions(400, 600);
      });

    });



    return {
      mountPoint
    };
  }
}
