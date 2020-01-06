
import _ from 'lodash';

import {
  ref,
  Ref,
  watch,
} from '@vue/composition-api';


import Layout from '~/components/story-default-layout/index.vue';
import { useSuperimposedElements, ElementTypes } from '~/components/compositions/superimposed-elements';
import { useTextOverlay } from '~/components/compositions/text-overlay';
import { initState, waitFor } from '~/components/compositions/component-basics';
import { useSvgDrawTo } from '../../drawto-canvas';
import { BBox } from 'sharedLib';
import chroma from 'chroma-js';
import { TextStyle } from '~/lib/html-text-metrics';

export function drawRect(bbox: BBox) {
  // const pg = new PIXI.Graphics();

  const { x, y, width, height } = bbox;
  // const fillcolor = chroma('red').num();
  const linecolor = chroma('yellow').num();

  // pg.lineStyle(1, linecolor, 0.3);
  // // pg.beginFill(fillcolor);
  // pg.drawRect(x, y, width, height);
  // // pg.endFill();

  // return pg;
}

export default {
  components: { Layout },
  setup() {

    const state = initState();

    const mountPoint: Ref<HTMLDivElement|null> = ref(null);
    const superimposedElements = useSuperimposedElements({
      includeElems: [ElementTypes.Text, ElementTypes.Canvas, ElementTypes.Img, ElementTypes.Svg],
      mountPoint, state
    });

    const canvas = superimposedElements.overlayElements.canvas!;
    const svgDrawTo = useSvgDrawTo({ canvas, containerRef: mountPoint, state });
    // const { pixiJsAppRef } = svgDrawTo;

    // Set text size, print text, overlay canvas or svg rect, print dimensions
    // Set text color, styles, ...

    const textDimensions = ref('init');
    const textSize = ref(45);
    const inputText = ref('My Big Text');
    const textTop = ref(20);
    const textLeft = ref(20);
    const textFamily = ref('arial');
    const textOverlay = useTextOverlay({ superimposedElements, state });

    // Draw text, canvas shape at same point
    // Scale/resize overlays up/down, overlays stay aligned
    // Show dimensions of text in story sidebar

    // drawRect(x, y, w, h)
    // drawText('a b c', at={x, y})


    waitFor('', {
      state,
      dependsOn: [mountPoint],

    }, () => {
      // const pixiJsApp = pixiJsAppRef.value!;
      superimposedElements.setDimensions(300, 350);
      watch([inputText, textSize, textTop, textLeft, textFamily], () => {
        const input = inputText.value;
        const inputLines = input.split('\n');
        const size = textSize.value;
        const top = textTop.value;
        const left = textLeft.value;
        const family = textFamily.value;
        const style: TextStyle = {
          size,
          style: 'normal',
          family,
          weight: 'normal'
        };

        // pixiJsApp.stage.removeChildren();
        textOverlay.clearText();

        _.each(inputLines, (line, linenum) => {
          const lineDimensions = textOverlay.putTextLn(style, left, top+(linenum*size), line)
          const dims = lineDimensions.elementDimensions;
          const dimStrs = _.map(dims, d => {
            return `[${d.x}, ${d.y}, ${d.width}, ${d.height}]`;
          });
          const dimFmt = _.join(dimStrs, '\n');
          textDimensions.value = dimFmt;

          const boundingRects = _.map(dims, d => {
            const bbox = new BBox(d.x, d.y, d.width, d.height);
            return drawRect(bbox);
          });
          if (boundingRects.length > 0) {
            // pixiJsApp.stage.addChild(...boundingRects)
          }

        });

      });

    });

    return {
      mountPoint,
      textDimensions,
      textSize,
      inputText,
      textTop,
      textLeft,
      textFamily,
    };
  }
}
