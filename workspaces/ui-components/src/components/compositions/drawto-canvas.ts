import _ from 'lodash';

import {
  ref,
  Ref,
  watch,
} from '@vue/composition-api';

import * as PIXI from 'pixi.js';
import { initPixiJs } from '~/lib/pixijs-utils';
import { StateArgs, waitFor } from '~/components/compositions/component-basics'

// type SetImageSource = void;

export interface CanvasDrawto {
  pixiJsAppRef: Ref<PIXI.Application|null>
  setImageSource: (src: string) => void;
}


type Args = StateArgs & {
  canvasRef: Ref<HTMLCanvasElement|null>,
  containerRef: Ref<HTMLDivElement|null>
};

export function useCanvasDrawto({
  state,
  canvasRef,
  containerRef
}: Args): CanvasDrawto {
  const pixiJsAppRef: Ref<PIXI.Application|null> = ref(null);
  const bgImageSrc: Ref<string|null> = ref(null);
  const bgImageRef: Ref<PIXI.Sprite|null> = ref(null);

  waitFor('CanvasDrawto', {
    state,
    dependsOn: [canvasRef, containerRef],
  }, () => {
    const canvasElem = canvasRef.value!;
    const divElem = containerRef.value!;

    const app = initPixiJs(canvasElem, divElem);
    app.resize();

    pixiJsAppRef.value = app;


    app.view.onresize = function (ev: UIEvent) {
      const bgImage = bgImageRef.value;
      if (bgImage) {
        const canvas: HTMLCanvasElement = ev.currentTarget as HTMLCanvasElement;
        bgImage.width = canvas.width;
        bgImage.height = canvas.height;
      }
    }
    watch(bgImageSrc, () => {
      const src = bgImageSrc.value;
      if (src) {
        const bgImage = PIXI.Texture.from(src);
        const pg = new PIXI.Sprite(bgImage);
        pg.width = app.view.width;
        pg.height = app.view.height;
        bgImageRef.value = pg;
        app.stage.addChild(pg);
      }
    });

  });
  function setImageSource(src: string) {
    bgImageSrc.value = src;
  }

  return {
    pixiJsAppRef,
    setImageSource
  };
}
