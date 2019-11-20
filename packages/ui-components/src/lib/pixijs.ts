
import * as PIXI from 'pixi.js';
import { Application } from 'pixi.js';


export function initPixiJs(canvasElem: HTMLCanvasElement): Application {

  const app = new PIXI.Application({
    // autoStart?: boolean;
    width: canvasElem.width, // number;
    height: canvasElem.height, // number;
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
    resizeTo: canvasElem // Window | HTMLElement;
  });
  return app;
}
