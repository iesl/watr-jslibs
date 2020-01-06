import {
  ref,
  Ref,
} from '@vue/composition-api';


import { useSuperimposedElements, ElementTypes } from '~/components/compositions/superimposed-elements'
import { useSvgDrawTo } from '~/components/compositions/drawto-canvas';
import { initState, waitFor } from '~/components/compositions/component-basics';

export default {
  setup() {

    const state = initState();

    const mountPoint: Ref<HTMLDivElement|null> = ref(null);
    const containerRef = mountPoint;

    const superimposedElements = useSuperimposedElements({ includeElems: [ElementTypes.Canvas], mountPoint, state });
    const canvas = superimposedElements.overlayElements.canvas!;
    const svgDrawTo = useSvgDrawTo({ canvas, containerRef, state });
    // const { pixiJsAppRef } = svgDrawTo;

    waitFor('SvgDrawToStory', {
      state,
      dependsOn: []
    }, () => {

      // const pixiJsApp = pixiJsAppRef.value!;
      superimposedElements.setDimensions(600, 800);

      // const pg = new PIXI.Graphics();

      // Rectangle
      // pg.lineStyle(2, 0xFEEB77, 1);
      // pg.beginFill(0x650A5A);
      // pg.drawRect(200, 50, 100, 100);
      // pg.endFill();

      // // Circle + line style 1
      // pg.lineStyle(2, 0xFEEB77, 1);
      // pg.beginFill(0x650A5A, 1);
      // pg.drawCircle(250, 250, 50);
      // pg.endFill();

      // pixiJsApp.stage.addChild(pg)

    });

    return {
      mountPoint
    };
  }
}
