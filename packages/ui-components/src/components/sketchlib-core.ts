/**
  */
import _ from 'lodash';

import * as PIXI from 'pixi.js';

import {
  watch,
} from '@vue/composition-api';

import { DrawToCanvas } from './drawto-canvas';
import { EventlibCore } from './eventlib-core';
import { StateArgs, waitFor } from '~/components/component-basics'
import { EventlibSelect } from './eventlib-select';

// - Tracelog shape drawing
// - Labeling regions with rectangular selection

type Args = StateArgs & {
  canvasDrawto: DrawToCanvas,
  eventlibCore: EventlibCore,
  eventlibSelect: EventlibSelect,
};

export function useSketchlibCore({ state, canvasDrawto, eventlibCore, eventlibSelect }: Args)  {
  waitFor('SketchlibCore', {
    state
  }, () => {


    const { selectionRef }  = eventlibSelect;

    watch(selectionRef, (sel) => {
      const { pixiJsAppRef } = canvasDrawto;
      const pixiJsApp = pixiJsAppRef.value;

      console.log('sel', sel.toString());

      const pg = new PIXI.Graphics();

      const { x, y, width, height } = sel;

      pg.lineStyle(2, 0xFEEB77, 1);
      pg.beginFill(0x650A5A);
      pg.drawRect(x, y, width, height);
      pg.endFill();

      pixiJsApp.stage.addChild(pg)
    });
  });

  return {

  }
}
