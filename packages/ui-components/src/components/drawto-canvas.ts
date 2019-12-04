import _ from 'lodash';

import {
  ref,
  Ref,
  onMounted,
} from '@vue/composition-api';

import * as PIXI from 'pixi.js';
import { initPixiJs } from '~/lib/pixijs-utils';
import { StateArgs, waitFor } from '~/components/component-basics'

export interface DrawToCanvas {
  pixiJsAppRef: Ref<PIXI.Application>
}

type Args = StateArgs & {
  canvasRef: Ref<HTMLCanvasElement>,
  containerRef: Ref<HTMLDivElement>
};

export function useCanvasDrawto({
  state,
  canvasRef,
  containerRef
}: Args): DrawToCanvas {
  let pixiJsAppRef: Ref<PIXI.Application> = ref(null);

  waitFor('CanvasDrawto', {
    state,
    dependsOn: [canvasRef, containerRef],
  }, () => {
    const canvasElem = canvasRef.value;
    const divElem = containerRef.value;

    const app = initPixiJs(canvasElem, divElem);
    app.resize();

    pixiJsAppRef.value = app;

    // onMounted(() => {});

  });



  return {
    pixiJsAppRef
  };
}