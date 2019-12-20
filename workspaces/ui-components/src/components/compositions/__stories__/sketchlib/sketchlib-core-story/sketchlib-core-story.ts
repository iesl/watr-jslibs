
import {
  ref,
  Ref,
  onMounted,
} from '@vue/composition-api';


import { useSuperimposedElements, ElementTypes } from '~/components/compositions/superimposed-elements'
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

    const superimposedElements = useSuperimposedElements({ includeElems: [ElementTypes.Canvas], mountPoint, state });

    const canvas = superimposedElements.overlayElements.canvas!;

    const canvasDrawto = useCanvasDrawto({ canvas, containerRef, state });
    const eventlibSelect = useEventlibSelect({ eventlibCore, canvasDrawto, state });

    useSketchlibCore({ state, canvasDrawto, eventlibCore, eventlibSelect });


    onMounted(() => {

      waitFor('SketchlibCoreStory', { state }, () => {
        superimposedElements.setDimensions(400, 600);
      });

    });



    return {
      mountPoint
    };
  }
}
