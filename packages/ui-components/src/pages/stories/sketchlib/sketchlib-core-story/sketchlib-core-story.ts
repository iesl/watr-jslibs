
import {
  ref,
  Ref,
} from '@vue/composition-api';

// import * as PIXI from 'pixi.js';

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

    // layerRoot is undefined:
    const eventlibCore = useEventlibCore({ targetDivRef: layerRoot, state } );
    // layerRoot is now defined (based on dependsOn: [..])

    // containerRef is defined (but still appears in dependsOn)
    const elemOverlay = useImgCanvasOverlays({ containerRef, state });

    const canvasRef = elemOverlay.elems.canvasElem
    const canvasDrawto = useCanvasDrawto({ canvasRef, containerRef, state });
    const eventlibSelect = useEventlibSelect({ eventlibCore, canvasDrawto, state });

    const sketchlibCore = useSketchlibCore({ state, canvasDrawto, eventlibCore, eventlibSelect });
    console.log('state', state.currentState());

    waitFor('SketchlibCoreStory', { state }, () => {
      elemOverlay.setDimensions(400, 600);
    });

    return {
      layerRoot
    };
  }
}
