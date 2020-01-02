
// import Layout from '~/components/story-default-layout/index.vue';
import TitledLayout from '~/components/story-templates/titled-frame-template/index.vue';
import LeftRightLayout from '~/components/story-templates/left-right-template/index.vue';

import {
  ref,
  Ref,
  watch,
} from '@vue/composition-api';

import { MouseHandlerInit, EMouseEvent } from '~/lib/EventlibHandlers';

import { useSuperimposedElements, ElementTypes } from '~/components/compositions/superimposed-elements'
import { useCanvasDrawto } from '~/components/compositions/drawto-canvas';
import { useSketchlibCore } from '~/components/compositions/sketchlib-core';
import { useEventlibCore } from '~/components/compositions/eventlib-core';
import { useEventlibSelect, selectExtentHandlers } from '~/components/compositions/eventlib-select'
import { initState, waitFor } from '~/components/compositions/component-basics'

import { Line, Point, foldShape, ShapeToSvgElement, Rect, Trapezoid, initShape, ShapeKind, zeroShape0, zeroShape1, Shape } from '~/lib/tracelogs';
import { BBox } from 'sharedLib';

type InkwellItem = {
  title: ShapeKind
}
const inkwellOptions: InkwellItem[]  = [
  { title: 'point' },
  { title: 'line' },
  { title: 'rect' },
  { title: 'trapezoid' },
];

export function initShapeForSelection(shapeKind: ShapeKind, selectedRect: BBox): Shape {
  const {top, left, width, height, right, bottom } = selectedRect;

  // const newShape = zeroShape1(shapeKind, {
  //   point: (p: Point) => {
  //     p.x = left;
  //     p.y = top;
  //     return p;
  //   },
  //   rect: (r: Rect) => {
  //     r.bounds = [left, top, width, height];
  //     return r;
  //   },
  //   line: (l: Line) => {
  //     l.p1.x = left;
  //     l.p1.y = top;
  //     l.p2.x = right;
  //     l.p2.y = bottom;
  //     return l;
  //   },
  //   trapezoid: (t: Trapezoid) => {
  //     const topWidth = width / 2;
  //     const bottomWidth = height * 2;
  //     t.topWidth = topWidth;
  //     t.bottomWidth = bottomWidth;
  //     t.topLeft.x = left;
  //     t.topLeft.y = top;
  //     t.bottomLeft.x = left-height/2;
  //     t.bottomLeft.y = bottom;
  //     return t;
  //   },
  // });
  // return newShape;
}

export function clickToDrawHandlers(shapeKindRef: Ref<string>) {
  const extentHandlers = selectExtentHandlers();
  const { origin, current, done, cancelled } = extentHandlers.refs;
  const handlers = extentHandlers.handlers;

  watch(origin, (o) => {
    initShapeForSelection(shapeKindRef.value)


  });
  watch(current, (c) => {

  });
  watch(done, (d) => {

  });
  // const install = () => {};
  // const uninstall = () => {};
  const keyHandlers = {
    // kepress/1: setShape(Point)
    // kepress/2: setShape(Rect)

  };
}

// (localState: S) => {
//   const rectSelectHandlers = {
//     init: () => { turnOff(Hover/ClickSelect/tooltips)  }
//     dispose: () => { turnBackOn(Hover/ClickSelect/tooltips)  }
//     mouseover: (e) => {...}
//     mousemove: (e) => {...}
//     keydown: {
//       'ctrl': () => endSelect, uninstall()
//     }
//   }
// }

export default {
  components: { TitledLayout, LeftRightLayout },
  setup() {

    const state = initState();

    const mountPoint: Ref<HTMLDivElement|null> = ref(null);
    const containerRef = mountPoint;
    const eventlibCore = useEventlibCore({ targetDivRef: mountPoint, state } );
    const inkwellToggle = ref(0);
    const inkwellSelection: Ref<ShapeKind> = ref('point');

    const superimposedElements = useSuperimposedElements({ includeElems: [ElementTypes.Canvas, ElementTypes.Svg], mountPoint, state });

    const canvas = superimposedElements.overlayElements.canvas!;

    const canvasDrawto = useCanvasDrawto({ canvas, containerRef, state });
    const eventlibSelect = useEventlibSelect({ eventlibCore, canvasDrawto, state });
    const { selectionRef } = eventlibSelect;

    useSketchlibCore({ state, canvasDrawto, eventlibCore, eventlibSelect });

    const myHandlers1  = () =>  {
      return {
        // mousedown   : onMouseDown,
        // mousemove   : onMouseMove,
      }
    }
    eventlibCore.setMouseHandlers([myHandlers1])
    // Draw shapes
    // Hover over shapes:
    //   visual flash
    //   tooltip
    //   click/select/delete


    // UI: select and draw shape type
    //   do hover/sel/del/...

    waitFor('SketchlibCoreStory', {
      state,
      dependsOn: [mountPoint]
    }, () => {
      superimposedElements.setDimensions(400, 600);
      const svg = superimposedElements.overlayElements.svg!;

      watch(inkwellToggle, (inkwellSel) => {
        inkwellSelection.value = inkwellOptions[inkwellSel].title;
      });

      watch(selectionRef, (selectedRect) => {
        if (!selectedRect) return;
        const shapeKind = inkwellSelection.value;
        const newShape = initShapeForSelection(shapeKind, selectedRect);
        svg.append(newShape);
      });

    });

    return {
      mountPoint,
      inkwellToggle,
      inkwellSelection,
    };
  }
}
