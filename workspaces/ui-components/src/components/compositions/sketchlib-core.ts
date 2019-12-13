/**
 * Tracelog shape drawing
 */

import _ from 'lodash';

import {
  watch,
} from '@vue/composition-api';

import { CanvasDrawto } from './drawto-canvas';
import { EventlibCore } from './eventlib-core';
import { StateArgs, waitFor } from '~/components/compositions/component-basics'
import { EventlibSelect } from './eventlib-select';
import { drawRect } from '~/lib/pixijs-utils';


type Args = StateArgs & {
  canvasDrawto: CanvasDrawto,
  eventlibCore: EventlibCore,
  eventlibSelect: EventlibSelect,
};

export function useSketchlibCore({ state, canvasDrawto, eventlibSelect }: Args)  {
  const { pixiJsAppRef } = canvasDrawto;

  waitFor('SketchlibCore', {
    state,
    dependsOn: [pixiJsAppRef]
  }, () => {

    const pixiJsApp = pixiJsAppRef.value!;

    const { selectionRef } = eventlibSelect;

    watch(selectionRef, (sel) => {
      if (sel) {
        const r = drawRect(sel);
        pixiJsApp.stage.addChild(r)
      }
    });
  });

  return {

  }
}

