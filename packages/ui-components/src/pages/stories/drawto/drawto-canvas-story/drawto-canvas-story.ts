import {
  ref,
  watch,
  Ref,
  onMounted,
} from '@vue/composition-api';

import * as PIXI from 'pixi.js';


import { useImgCanvasOverlays } from '~/components/elem-overlays'
import { useCanvasDrawto } from '~/components/drawto-canvas';

export default {
  setup() {

    const layerRoot: Ref<HTMLDivElement> = ref(null);

    const elemOverlay = useImgCanvasOverlays(layerRoot);
    const canvasElemRef = elemOverlay.elems.canvasElem
    const canvasDrawto = useCanvasDrawto(canvasElemRef, layerRoot);
    const pixiJsAppRef = canvasDrawto.pixiJsAppRef;

    watch(pixiJsAppRef, (pixiJsApp) => {
      if (pixiJsApp === null) return;

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

    onMounted(() => {

    });


    return {
      layerRoot
    };
  }
}
