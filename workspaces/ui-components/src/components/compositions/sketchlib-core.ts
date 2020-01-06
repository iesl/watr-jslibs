/**
 * Tracelog shape drawing
 */

import _ from 'lodash';

import {
  watch,
} from '@vue/composition-api';

import { SvgDrawTo } from './svg-drawto';
import { EventlibCore } from './eventlib-core';
import { StateArgs, waitFor } from '~/components/compositions/component-basics'
import { EventlibSelect } from './eventlib-select';
// import { drawRect } from '~/lib/pixijs-utils';


type Args = StateArgs & {
  svgDrawTo: SvgDrawTo,
  eventlibCore: EventlibCore,
  eventlibSelect: EventlibSelect,
};

export function useSketchlibCore({ state, svgDrawTo, eventlibSelect }: Args)  {
  // const { pixiJsAppRef } = svgDrawTo;

  waitFor('SketchlibCore', {
    state,
    dependsOn: []
  }, () => {

    // const pixiJsApp = pixiJsAppRef.value!;

    const { selectionRef } = eventlibSelect;

    watch(selectionRef, (sel) => {
      if (sel) {
        // const r = drawRect(sel);
        // pixiJsApp.stage.addChild(r)
      }
    });
  });

  return {

  }
}

