import {
  ref,
  Ref,
} from '@vue/composition-api';

import * as PIXI from 'pixi.js';


import { useImgCanvasOverlays } from '~/components/elem-overlays'
import { useCanvasDrawto } from '~/components/drawto-canvas';
import { initState, waitFor } from '~/components/component-basics';

export default {
  setup() {

    const state = initState();

    const layerRoot: Ref<HTMLDivElement> = ref(null);
    const containerRef = layerRoot;

    const elemOverlay = useImgCanvasOverlays({ containerRef, state });
    const canvasRef = elemOverlay.elems.canvasElem
    const canvasDrawto = useCanvasDrawto({ canvasRef, containerRef, state });

    waitFor('CanvasDrawtoStory', {
      state
    }, () => {
      // watch(pixiJsAppRef, (pixiJsApp) => {
      // if (pixiJsApp === null) return;

      const { pixiJsAppRef } = canvasDrawto;

      const pixiJsApp = pixiJsAppRef.value;
      elemOverlay.setDimensions(600, 800);

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

      pixiJsApp.stage.addChild(pg)
      // });
    });

    return {
      layerRoot
    };
  }
}
