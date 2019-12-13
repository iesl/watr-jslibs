import {
  ref,
  Ref,
} from '@vue/composition-api';

import * as PIXI from 'pixi.js';


import { useImgCanvasOverlays } from '~/components/compositions/elem-overlays'
import { useCanvasDrawto } from '~/components/compositions/drawto-canvas';
import { initState, waitFor } from '~/components/compositions/component-basics';

export default {
  setup() {

    const state = initState();

    const mountPoint: Ref<HTMLDivElement|null> = ref(null);
    const containerRef = mountPoint;

    const elemOverlay = useImgCanvasOverlays({ mountPoint, state });
    const canvasRef = elemOverlay.elems.canvasElem
    const canvasDrawto = useCanvasDrawto({ canvasRef, containerRef, state });
    const { pixiJsAppRef } = canvasDrawto;

    waitFor('CanvasDrawtoStory', {
      state,
      dependsOn: [pixiJsAppRef]
    }, () => {

      const pixiJsApp = pixiJsAppRef.value!;
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

    });

    return {
      mountPoint
    };
  }
}
