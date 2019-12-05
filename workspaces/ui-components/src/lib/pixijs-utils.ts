
import * as PIXI from 'pixi.js';
import { Application } from 'pixi.js';
import { BBox } from 'sharedLib';

export function initPixiJs(canvasElem: HTMLCanvasElement, containerDiv: HTMLDivElement): Application {

  const app = new PIXI.Application({
    // autoStart?: boolean;
    // width: canvasElem.width, // number;
    // height: canvasElem.height, // number;
    view: canvasElem,
    transparent: true,
    // autoDensity?: boolean;
    // antialias?: boolean;
    // preserveDrawingBuffer?: boolean;
    // resolution?: number;
    // forceCanvas:true,
    // backgroundColor?: number;
    // clearBeforeRender?: boolean;
    // forceFXAA?: boolean;
    // powerPreference?: string;
    // sharedTicker?: boolean;
    // sharedLoader?: boolean;
    resizeTo: containerDiv
  });
  return app;
}

import chroma from 'chroma-js';

export function drawRect(bbox: BBox) {
  const pg = new PIXI.Graphics();

  const { x, y, width, height } = bbox;
  const fillcolor = chroma('red').num();

  pg.lineStyle(2, 0xFEEB77, 1);
  pg.beginFill(fillcolor);
  pg.drawRect(x, y, width, height);
  pg.endFill();

  return pg;
}
