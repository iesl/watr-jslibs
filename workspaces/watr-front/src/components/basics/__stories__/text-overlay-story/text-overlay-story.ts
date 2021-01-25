import _ from 'lodash';
import * as d3 from 'd3-selection';

import {
  ref,
  Ref,
  watch,
} from '@vue/composition-api';


import { useSuperimposedElements, ElementTypes } from '~/components/basics/superimposed-elements';
import { useMeasuredTextOverlay } from '~/components/basics/measured-text-overlay';
import { initState, waitFor } from '~/components/basics/component-basics';
import chroma from 'chroma-js';
import { TextStyle } from '~/lib/html-text-metrics';
import { BBox } from '~/lib/coord-sys';

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
  setup() {

    const state = initState();

    const mountPoint: Ref<HTMLDivElement|null> = ref(null);
    const superimposedElements = useSuperimposedElements({
      includeElems: [ElementTypes.Text, ElementTypes.Canvas, ElementTypes.Img, ElementTypes.Svg],
      mountPoint, state
    });

    // const canvas = superimposedElements.overlayElements.canvas!;
    // const svgDrawTo = useSvgDrawTo({ containerRef: mountPoint, state });

    // Set text size, print text, overlay canvas or svg rect, print dimensions
    // Set text color, styles, ...

    const textDimensions = ref('init');
    const textSize = ref(45);
    const inputText = ref('Hover This Text');
    const textTop = ref(20);
    const textLeft = ref(20);
    const textFamily = ref('arial');
    const textOverlay = useMeasuredTextOverlay({ superimposedElements, state });

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
      const svgLayer = superimposedElements.overlayElements.svg!;
      superimposedElements.setDimensions(500, 350);


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

        textOverlay.clearText();

        const svgSelect = d3.select(svgLayer);

        _.each(inputLines, (line, linenum) => {
          const lineDimensions = textOverlay.putTextLn(style, left, top+(linenum*size), line)
          const dims = lineDimensions.elementDimensions;
          svgSelect
            .selectAll('.chars')
            .data(dims, (d: any) => `${d.x}x${d.y}`)
            .join('rect')
            .classed('chars', true)
            .attr('x', (d: any) => d.x)
            .attr('y', (d: any) => d.y)
            .attr('width', (d: any) => d.width)
            .attr('height', (d: any) => d.height)
            .attr('stroke', 'blue')
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 0.8)
            .attr('fill', 'yellow')
            .attr('fill-opacity', 0.3)
          ;

          const dimStrs = _.map(dims, d => {
            return `[${d.x}, ${d.y}, ${d.width}, ${d.height}]`;
          });
          const dimFmt = _.join(dimStrs, '\n');
          textDimensions.value = dimFmt;

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
