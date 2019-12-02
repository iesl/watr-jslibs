/**
 * Draw selection rectangles and create selection events
 */
import _ from 'lodash';

import {
  watch,
  onMounted,
  ref,
} from '@vue/composition-api';

// import { DrawToCanvas } from './drawto-canvas';

import { EMouseEvent, MouseHandlerInit } from '~/lib/EventlibHandlers';
import { EventlibCore } from './eventlib-core';
import { DrawToCanvas } from './drawto-canvas';
import { BBox, Point } from 'sharedLib';
import * as PIXI from 'pixi.js';


function pointsToRect(p1: Point, p2: Point): BBox {
  let ny = Math.min(p1.y, p2.y);
  let nx = Math.min(p1.x, p2.x);
  let nwidth = Math.abs(p1.x - p2.x);
  let nheight = Math.abs(p1.y - p2.y);

  return new BBox(nx, ny, nwidth, nheight);
  // return {left: nx, top: ny, width: nwidth, height: nheight};
}


export function useEventlibSelect(eventlibCore: EventlibCore, drawTo: DrawToCanvas) {

  const { setMouseHandlers } = eventlibCore;
  const { pixiJsAppRef } = drawTo;

  const selectionRef = ref(new BBox(0, 0, 0, 0));

  let selecting = false;
  let originPt: Point = new Point(0, 0);
  let currentPt: Point = new Point(0, 0);


  watch(pixiJsAppRef, (pixiJsApp) => {
    if (pixiJsApp === null) return;

    const pgRect = new PIXI.Graphics();

    function drawCurrentRect() {
      const currBBox = pointsToRect(originPt, currentPt);
      pgRect.clear();
      pgRect.beginFill(0x650A5A);
      pgRect.lineStyle(4, 0xFEEB77, 1);
      pgRect.drawRect(currBBox.x, currBBox.y, currBBox.width, currBBox.height);
      pgRect.endFill();
    }

    const onMouseDown = (e: EMouseEvent) => {
      const {x, y} = e.pos;
      originPt = currentPt = new Point(x, y);
      // Rectangle
      pixiJsApp.stage.addChild(pgRect)
      drawCurrentRect();

      selecting = true;
    };

    const onMouseMove = (e: EMouseEvent) => {
      if (selecting) {
        const {x, y} = e.pos;
        currentPt = new Point(x, y);
        drawCurrentRect();
      }
    }

    const onMouseUp = (e: EMouseEvent) => {
      if (currentPt !== originPt) {
        const currBBox = pointsToRect(originPt, currentPt);
        selectionRef.value = currBBox;
        pixiJsApp.stage.removeChild(pgRect);
      }
    }

    const onMouseOut = (e: EMouseEvent) => {
      // userWithinPageBounds = false;
      if (selecting) {
        const {x, y} = e.pos;
        currentPt = new Point(x, y);
        drawCurrentRect();
      }
    }

    const onMouseOver = (e: EMouseEvent) => {
      // userWithinPageBounds = false;

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
