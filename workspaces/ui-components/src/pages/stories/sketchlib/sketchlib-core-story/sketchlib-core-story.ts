
import {
  ref,
  Ref,
  onMounted,
} from '@vue/composition-api';

import * as PIXI from 'pixi.js';

import { useImgCanvasOverlays } from '~/components/elem-overlays'
import { useCanvasDrawto } from '~/components/drawto-canvas';
import { useSketchlibCore } from '~/components/sketchlib-core';
import { useEventlibCore } from '~/components/eventlib-core';
import { useEventlibSelect } from '~/components/eventlib-select'
import { initState, waitFor } from '~/components/component-basics'

export default {
  setup() {

    const state = initState();

    // waitFor rationale:
    const layerRoot: Ref<HTMLDivElement> = ref(null);
    const containerRef = layerRoot;
    const eventlibCore = useEventlibCore({ targetDivRef: layerRoot, state } );

    const elemOverlay = useImgCanvasOverlays({ containerRef, state });

    const canvasRef = elemOverlay.elems.canvasElem

    const canvasDrawto = useCanvasDrawto({ canvasRef, containerRef, state });
    const eventlibSelect = useEventlibSelect({ eventlibCore, canvasDrawto, state });

    const sketchlibCore = useSketchlibCore({ state, canvasDrawto, eventlibCore, eventlibSelect });


    onMounted(() => {

      waitFor('SketchlibCoreStory', { state }, () => {
        elemOverlay.setDimensions(400, 600);
      });

    });



    return {
      layerRoot
    };
  }
}
