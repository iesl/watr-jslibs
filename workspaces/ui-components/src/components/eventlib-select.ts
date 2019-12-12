/**
 * Draw selection rectangles and create selection events
 */
import _ from 'lodash';

import {
  ref,
  Ref,
} from '@vue/composition-api';

import { EMouseEvent, MouseHandlerInit } from '~/lib/EventlibHandlers';
import { EventlibCore } from './eventlib-core';
import { CanvasDrawto } from './drawto-canvas';
import { BBox, Point } from 'sharedLib';
import { StateArgs, waitFor } from '~/components/component-basics'

import * as PIXI from 'pixi.js';
import chroma from 'chroma-js';


function pointsToRect(p1: Point, p2: Point): BBox {
  let ny = Math.min(p1.y, p2.y);
  let nx = Math.min(p1.x, p2.x);
  let nwidth = Math.abs(p1.x - p2.x);
  let nheight = Math.abs(p1.y - p2.y);

  return new BBox(nx, ny, nwidth, nheight);
  // return {left: nx, top: ny, width: nwidth, height: nheight};
}

export interface EventlibSelect {
  selectionRef: Ref<BBox|null>;
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

  const selectionRef = ref(new BBox(0, 0, 0, 0));
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
    selectionRef
  }
}
