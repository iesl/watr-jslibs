
import Layout from '~/components/story-default-layout/index.vue';

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
import { Line, Point, foldShape, ShapeAdjustUnitsFold, ShapeToSvgFold, ShapeToSvgElement, Rect } from '~/lib/tracelogs';

export default {
  components: { Layout },
  setup() {

    const state = initState();

    const mountPoint: Ref<HTMLDivElement|null> = ref(null);
    const containerRef = mountPoint;
    const eventlibCore = useEventlibCore({ targetDivRef: mountPoint, state } );

    const superimposedElements = useSuperimposedElements({ includeElems: [ElementTypes.Canvas, ElementTypes.Svg], mountPoint, state });

    const canvas = superimposedElements.overlayElements.canvas!;

    const canvasDrawto = useCanvasDrawto({ canvas, containerRef, state });
    const eventlibSelect = useEventlibSelect({ eventlibCore, canvasDrawto, state });

    useSketchlibCore({ state, canvasDrawto, eventlibCore, eventlibSelect });

    waitFor('SketchlibCoreStory', {
      state,
      dependsOn: [mountPoint]
    }, () => {
      superimposedElements.setDimensions(400, 600);
      const svg = superimposedElements.overlayElements.svg!;

      const ext = { id: 0, labels: '' };
      const p1: Point = {
        kind: 'point',
        ...ext,
        x: 20*100,
        y: 50*100
      } ;
      const p2: Point = {
        kind: 'point',
        ...ext,
        x: 80*100,
        y: 300*100
      };
      const line1: Line = {
        kind: 'line',
        ...ext,
        p1,
        p2,
      };


      const adj = foldShape(line1, ShapeAdjustUnitsFold)!;
      const asSvg = foldShape(adj!, ShapeToSvgElement)!;
      svg.append(asSvg);

      const r1: Rect = {
        kind: 'rect',
        ...ext,
        bounds: [
          90*100,
          10*100,
          40*100,
          200*100,
        ]
      };
      const rv1 = foldShape(r1, ShapeAdjustUnitsFold)!;
      const rv2 = foldShape(rv1!, ShapeToSvgElement)!;
      svg.append(rv2);

    });

    return {
      mountPoint
    };
  }
}
