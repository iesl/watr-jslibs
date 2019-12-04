
import * as PIXI from 'pixi.js';
import { Application, Container } from 'pixi.js';
import { BBox } from 'sharedLib';

export function initPixiJs(canvasElem: HTMLCanvasElement, containerDiv: HTMLDivElement): Application {
  // PIXI.useDeprecated();

  console.log('initPixiJs running');
  // const app = new PIXI.Application();

  // // var this$1 = this;
  // const opts = {
  //   // autoStart?: boolean;
  //   // width: canvasElem.width, // number;
  //   // height: canvasElem.height, // number;
  //   view: canvasElem,
  //   // transparent?: boolean;
  //   // autoDensity?: boolean;
  //   // antialias?: boolean;
  //   // preserveDrawingBuffer?: boolean;
  //   // resolution?: number;
  //   // forceCanvas:true,
  //   // backgroundColor?: number;
  //   // clearBeforeRender?: boolean;
  //   // forceFXAA?: boolean;
  //   // powerPreference?: string;
  //   // sharedTicker?: boolean;
  //   // sharedLoader?: boolean;
  //   resizeTo: containerDiv
  // };

  // // The default options
  // const options = Object.assign({
  //   forceCanvas: false,
  // }, opts);

  // // 512, 384, {view:document.getElementById("game-canvas")}

  // const renderer = PIXI.autoDetectRenderer(options);
  // const stage = new PIXI.Container();
  // renderer.render(stage);

  // // install plugins here
  // // Application._plugins.forEach(function (plugin) {
  // //   plugin.init.call(this$1, options);
  // // });

  // return stage;




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

// import chroma from 'chroma-js';

export function drawRect(bbox: BBox) {
  const pg = new PIXI.Graphics();

  const { x, y, width, height } = bbox;
  // const fillcolor = chroma('red').num();
  const fillcolor = 0x203050;

  pg.lineStyle(2, 0xFEEB77, 1);
  pg.beginFill(fillcolor);
  pg.drawRect(x, y, width, height);
  pg.endFill();

  return pg;
}
