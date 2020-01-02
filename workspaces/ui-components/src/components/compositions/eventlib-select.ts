/**
 * Provide the ability to draw selection rectangles and emit selection events
 */
import _ from 'lodash';

import {
  ref,
  Ref,
  reactive,
  toRefs,
} from '@vue/composition-api';

import { EMouseEvent, MouseHandlerInit } from '~/lib/EventlibHandlers';
import { EventlibCore } from './eventlib-core';
import { CanvasDrawto } from './drawto-canvas';
import { BBox, Point } from 'sharedLib';
import { StateArgs, waitFor } from '~/components/compositions/component-basics'

import * as PIXI from 'pixi.js';
import chroma from 'chroma-js';


function pointsToRect(p1: Point, p2: Point): BBox {
  let ny = Math.min(p1.y, p2.y);
  let nx = Math.min(p1.x, p2.x);
  let nwidth = Math.abs(p1.x - p2.x);
  let nheight = Math.abs(p1.y - p2.y);

  return new BBox(nx, ny, nwidth, nheight);
}

export interface EventlibSelect {
  selectionRef: Ref<BBox|null>;
  clickedPointRef: Ref<Point|null>;
}

type Args = StateArgs & {
  canvasDrawto: CanvasDrawto,
  eventlibCore: EventlibCore,
};

export function useEventlibSelect({
  state,
  eventlibCore,
  canvasDrawto
}: Args) {

  // const selectionRef = ref(new BBox(0, 0, 0, 0));
  const selectionRef: Ref<BBox|null> = ref(null);
  const clickedPointRef: Ref<Point|null> = ref(null);
  const { pixiJsAppRef } = canvasDrawto;

  waitFor('EventlibSelect', {
    state,
    dependsOn: [canvasDrawto.pixiJsAppRef],
  }, () => {

    const { setMouseHandlers } = eventlibCore;

    const pixiJsApp = pixiJsAppRef.value!;

    let selecting = false;
    let originPt: Point = new Point(0, 0);
    let currentPt: Point = new Point(0, 0);


    const selectionRect = new PIXI.Graphics();
    const selectLineColor = chroma('blue').darken().num();

    function drawCurrentRect() {
      const currBBox = pointsToRect(originPt, currentPt);
      selectionRect.clear();
      selectionRect.lineStyle(2, selectLineColor);
      selectionRect.drawRect(currBBox.x, currBBox.y, currBBox.width, currBBox.height);
    }


    function flashCurrentRect(color: string) {
      let elapsed = 0;
      let flashFill = chroma(color);

      function _go() {
        elapsed += 1;
        if (elapsed < 10) {
          const currBBox = pointsToRect(originPt, currentPt);

          flashFill = flashFill.brighten(0.4);
          selectionRect.clear();
          selectionRect.beginFill(flashFill.num(), 0.4);
          selectionRect.drawRect(currBBox.x, currBBox.y, currBBox.width, currBBox.height);
          selectionRect.endFill();
        } else {
          pixiJsApp.ticker.remove(_go);
          endSelection();
        }
      }

      pixiJsApp.ticker.add(_go);

      // selectionRect.lineStyle(2, selectLineColor);
    }

    function endSelection() {
      selecting = false;
      selectionRect.clear();
      pixiJsApp.stage.removeChild(selectionRect);
    }

    const onMouseDown = (e: EMouseEvent) => {
      const {x, y} = e.pos;

      const { ctrlKey } = e.origMouseEvent;
      if (ctrlKey) {
        originPt = currentPt = new Point(x, y);
        pixiJsApp.stage.addChild(selectionRect)
        drawCurrentRect();

        selecting = true;
      }
    };

    const onMouseMove = (e: EMouseEvent) => {
      const { ctrlKey } = e.origMouseEvent;

      if (selecting) {
        if (ctrlKey) {
          const {x, y} = e.pos;
          currentPt = new Point(x, y);
          drawCurrentRect();
        } else {
          endSelection();
        }
      }
    }

    const onMouseUp = (e: EMouseEvent) => {
      const { ctrlKey } = e.origMouseEvent;

      if (selecting && ctrlKey) {
        if (currentPt !== originPt) {
          const currBBox = pointsToRect(originPt, currentPt);
          // Flash selection okay signal
          flashCurrentRect('green');

          selectionRef.value = currBBox;
        }
      }
      // endSelection();
    }

    const onMouseOut = (e: EMouseEvent) => {
      if (selecting) {
        const {x, y} = e.pos;
        currentPt = new Point(x, y);
        drawCurrentRect();
      }
    }

    const onMouseOver = (e: EMouseEvent) => {
      const { ctrlKey } = e.origMouseEvent;
      if (selecting) {
        if (ctrlKey) {
          const {x, y} = e.pos;
          currentPt = new Point(x, y);
          drawCurrentRect();
        } else {
          flashCurrentRect('red');
        }
      }
    }

    const myHandlers1: MouseHandlerInit = () =>  {
      return {
        mousedown   : onMouseDown,
        mousemove   : onMouseMove,
        // mouseenter  : e => shEvent2(e),
        // mouseleave  : e => shEvent2(e),
        mouseup     : onMouseUp,
        mouseout    : onMouseOut,
        mouseover   : onMouseOver,
      }
    }

    setMouseHandlers([myHandlers1]);

  });

  return {
    selectionRef,
    clickedPointRef
  }
}

export interface ExtentHandlerRefs {
  origin: Ref<[ number, number ]>;
  current: Ref<[ number, number ]>;
  done: Ref<boolean>;
  cancelled: Ref<boolean>;
}

export interface ExtentHandlers {
  refs: ExtentHandlerRefs;
  handlers: MouseHandlerInit;
}

export function selectExtentHandlers(): ExtentHandlers {

  let selecting = false;

  const refs: ExtentHandlerRefs = toRefs(reactive({
    origin: [0, 0] as [number, number],
    current: [0, 0] as [number, number],
    done: false, cancelled: false
  }));

  const mousedown = (e: EMouseEvent) => {
    const {x, y} = e.pos;
    refs.current.value = refs.origin.value = [x, y];
    selecting = true;
  };

  const mousemove = (e: EMouseEvent) => {
    if (selecting) {
      const {x, y} = e.pos;
      refs.current.value = [x, y];
    }
  }

  const mouseup = (e: EMouseEvent) => {
    if (selecting) {
      const {x, y} = e.pos;
      refs.current.value = [x, y];
      refs.done.value = true;
    }
  }

  const mouseout = (e: EMouseEvent) => {
    if (selecting) {
      const {x, y} = e.pos;
      refs.current.value = [x, y];
    }
  }

  const mouseover = (e: EMouseEvent) => {
    if (selecting) {
      const {x, y} = e.pos;
      refs.current.value = [x, y];
    }
  }

  const handlers: MouseHandlerInit = () =>  {
    return {
      mousedown,
      mousemove,
      mouseup,
      mouseout,
      mouseover,
    }
  }
  return {
    refs, handlers
  };

}
