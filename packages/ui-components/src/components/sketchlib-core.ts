/**
 * - Tracelog shape drawing
 * - Labeling regions with rectangular selection
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


type Args = StateArgs & {
  canvasDrawto: DrawToCanvas,
  eventlibCore: EventlibCore,
  eventlibSelect: EventlibSelect,
};

export function useSketchlibCore({ state, canvasDrawto, eventlibCore, eventlibSelect }: Args)  {
  const { pixiJsAppRef } = canvasDrawto;

  waitFor('SketchlibCore', {
    state,
    dependsOn: [pixiJsAppRef]
  }, () => {

    const pixiJsApp = pixiJsAppRef.value;

    const { selectionRef }  = eventlibSelect;

    watch(selectionRef, (sel) => {

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
