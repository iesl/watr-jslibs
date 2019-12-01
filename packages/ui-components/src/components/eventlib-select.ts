/**
 * Draw selection rectangles and create selection events
 */
import _ from 'lodash';

import {
  watch,
  onMounted,
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
  watch(pixiJsAppRef, (pixiJsApp) => {
    if (pixiJsApp === null) return;

    let userWithinPageBounds = true;
    let selecting = false;
    let originPt: Point = new Point(0, 0);
    let currentPt: Point = new Point(0, 0);
    const emptyRect: BBox = new BBox(originPt.x, originPt.y, 0, 0);

    const pgRect = new PIXI.Graphics();

    // let drawRect: PIXI.Graphics;

    emptyRect.width += 2;

    const initSelect = (e: EMouseEvent) => {
      const {x, y} = e.pos;
      originPt = currentPt = new Point(x, y);
      // Rectangle
      const currBBox = pointsToRect(originPt, currentPt);
      pgRect.drawRect(currBBox.x, currBBox.y, currBBox.width, currBBox.height);
      pgRect.lineStyle(2, 0xFEEB77, 1);
      pgRect.beginFill(0x650A5A);
      pgRect.endFill();

      pixiJsApp.stage.addChild(pgRect)
      selecting = true;
    };

    const onMove = (e: EMouseEvent) => {
      if (selecting) {
        const {x, y} = e.pos;
        currentPt = new Point(x, y);
        const currBBox = pointsToRect(originPt, currentPt);
        pgRect.clear()
        pgRect.lineStyle(2, 0xFEEB77, 1);
        pgRect.beginFill(0x650A5A);
        pgRect.drawRect(currBBox.x, currBBox.y, currBBox.width, currBBox.height);
        pgRect.endFill();
      }
    }

    const myHandlers1: MouseHandlerInit = () =>  {
      return {
        mousedown   : initSelect,
        mousemove   : onMove,
        // mouseenter  : e => shEvent2(e),
        // mouseleave  : e => shEvent2(e),
        mouseout    : () => userWithinPageBounds = false,
        mouseover   : () => userWithinPageBounds = true,
        // mouseup     : e => shEvent2(e),
        // click       : e => shEvent2(e),
        // dblclick    : e => shEvent2(e),
        // contextmenu : e => shEvent2(e),
      }
    }

    setMouseHandlers([myHandlers1]);

  });

  return {

  }
}
