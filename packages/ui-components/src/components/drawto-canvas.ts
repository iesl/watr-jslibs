import _ from 'lodash';

import {
  ref,
  Ref,
  watch,
} from '@vue/composition-api';

import * as PIXI from 'pixi.js';
import { initPixiJs } from '~/lib/pixijs-utils';

export interface DrawToCanvas {
  pixiJsAppRef: Ref<PIXI.Application>
}

export function useCanvasDrawto(
  canvasRef: Ref<HTMLCanvasElement>,
  containerDivRef: Ref<HTMLDivElement>
): DrawToCanvas {

  let pixiJsAppRef: Ref<PIXI.Application> = ref(null);

  watch([canvasRef, containerDivRef], () => {
    const canvasElem = canvasRef.value;
    const divElem = containerDivRef.value;

    if (canvasElem === null || divElem === null) return;

    pixiJsAppRef.value = initPixiJs(canvasElem, divElem);

  });

  return {
    pixiJsAppRef
  };
}
