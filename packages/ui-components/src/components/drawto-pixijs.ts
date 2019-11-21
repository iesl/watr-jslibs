import _ from 'lodash';

import {
  Ref,
  watch,
} from '@vue/composition-api';

import * as PIXI from 'pixi.js';
import { Application } from 'pixi.js';

export interface DrawToCanvas {

}

function initPixiJs(canvasElem: HTMLCanvasElement, containerDiv: HTMLDivElement): Application {

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

export function usePixiJsDrawto(
  canvasRef: Ref<HTMLCanvasElement>,
  containerDivRef: Ref<HTMLDivElement>
): DrawToCanvas {
  watch([canvasRef, containerDivRef], () => {
    const canvasElem = canvasRef.value;
    const divElem = containerDivRef.value;

    if (canvasElem === null || divElem === null) return;


    const app = initPixiJs(canvasElem, divElem);

    const pg = new PIXI.Graphics();

    // Rectangle
    pg.lineStyle(2, 0xFEEB77, 1);
    pg.beginFill(0x650A5A);
    pg.drawRect(200, 50, 100, 100);
    pg.endFill();

    // Circle + line style 1
    pg.lineStyle(2, 0xFEEB77, 1);
    pg.beginFill(0x650A5A, 1);
    pg.drawCircle(250, 250, 50);
    pg.endFill();

    app.stage.addChild(pg)

  });

  return {

  };
}
