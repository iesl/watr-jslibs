
import * as PIXI from 'pixi.js';
import { Application } from 'pixi.js';
import { BBox } from 'sharedLib';


export function initPixiJs(canvasElem: HTMLCanvasElement, containerDiv: HTMLDivElement): Application {

  const app = new PIXI.Application({
    // autoStart?: boolean;
    // width: canvasElem.width, // number;
    // height: canvasElem.height, // number;
    view: canvasElem,
    // transparent?: boolean;
    // autoDensity?: boolean;
    // antialias?: boolean;
    // preserveDrawingBuffer?: boolean;
    // resolution?: number;
    // forceCanvas?: boolean;
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

export function drawRect(bbox: BBox) {
  const pg = new PIXI.Graphics();

  const { x, y, width, height } = bbox;

  pg.lineStyle(2, 0xFEEB77, 1);
  pg.beginFill(0x650A5A);
  pg.drawRect(x, y, width, height);
  pg.endFill();

  return pg;
}
