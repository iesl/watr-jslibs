import _ from 'lodash';

import {
  Ref,
  watch,
} from '@vue/composition-api';

import * as PIXI from 'pixi.js';

import {
 initPixiJs
} from '~/lib/pixijs';

export interface DrawToCanvas {

}

export function useCanvasDrawto(canvasRef: Ref<HTMLCanvasElement>): DrawToCanvas {
  watch(canvasRef, () => {
    const canvasElem = canvasRef.value;
    if (canvasElem === null) return;


    const app = initPixiJs(canvasElem);

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
