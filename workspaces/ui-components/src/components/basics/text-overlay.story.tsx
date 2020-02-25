//
import _ from 'lodash';
import * as d3 from 'd3';

import {
  ref,
  Ref,
  watch,
} from '@vue/composition-api';


import { useSuperimposedElements, ElementTypes } from '~/components/basics/superimposed-elements';
import { useTextOverlay } from '~/components/basics/text-overlay';
import { initState, waitFor } from '~/components/basics/component-basics';
import { TextStyle } from '~/lib/html-text-metrics';
/* import { BBox } from '~/lib/coord-sys'; */


export default {
  /* props: {
   *   textSize: ref(45)
   * },
   */

  setup(props: any) {
    /* const self = this; */

    const state = initState();

    const mountPoint: Ref<HTMLDivElement|null> = ref(null);
    const superimposedElements = useSuperimposedElements({
      includeElems: [ElementTypes.Text, ElementTypes.Canvas, ElementTypes.Img, ElementTypes.Svg],
      mountPoint, state
    });

    const textDimensions = ref('init');
    const textSize = ref(45);
    const inputText = ref('Hover This Text');
    const textTop = ref(20);
    const textLeft = ref(20);
    const textFamily = ref('arial');
    const textOverlay = useTextOverlay({ superimposedElements, state });

    waitFor('', {
      state,
      dependsOn: [mountPoint],

    }, () => {
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
            .attr("x", (d: any) => d.x)
            .attr("y", (d: any) => d.y)
            .attr("width", (d: any) => d.width)
            .attr("height", (d: any) => d.height)
            .attr("stroke", 'blue')
            .attr("stroke-width", 1)
            .attr("stroke-opacity", 0.8)
            .attr("fill", 'yellow')
            .attr("fill-opacity", 0.3)
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

  },

  render() {

    //const textFieldz = (model: Ref<any>) => {
    //  return (
    //    <v-text-field outlined hide-details dense
    //      class="mt-3"
    //      label="Font Family"
    //      persistent-hint
    //      vModel={model}
    //    />
    //  );
    //}

    ///* const textSize = this.props.textSize; */
    //const controls = (
    //  <v-container>
    //    <v-row>
    //      <v-col justify="space-between" cols="4">
    //        {/* {textFieldz(textSize)} */}
    //        {/* {textFieldz(textTop)} */}
    //        {/* {textFieldz(textLeft)} */}
    //        {/* {textFieldz(textFamily)} */}
    //      </v-col>
    //    </v-row>
    //  </v-container>
    // );

    const scopedSlots = {
      title: () => 'Text Overlay',
      description: () => 'Text With RTree hovering enabled',
      main: () => <div class="mountPoint" ref='mountPoint'> </div>,
      notes: () => (<ul>
        <li>Setting Left value causes glitches</li>
        <li>Top seems to be in ems, Left in px</li>
        <li>Hovering</li>
        <li>Transparency</li>
      </ul>),
      /* controls: () => controls */
    };

    return (
      <layout scopedSlots={scopedSlots}>

      </layout>
    );

  }

};
