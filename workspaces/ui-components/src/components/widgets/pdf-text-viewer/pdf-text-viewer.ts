import _ from 'lodash';

import { ref, watch, Ref, createComponent, inject, onMounted, provide  } from '@vue/composition-api';

import { initState } from '~/components/compositions/component-basics'
import { useEventlibCore } from '~/components/compositions/eventlib-core';
import { useSuperimposedElements, ElementTypes } from '~/components/compositions/superimposed-elements';
import { useSvgDrawTo } from '~/components/compositions/svg-drawto';
import { useGlyphOverlays } from '~/components/compositions/glyph-overlay-component';
import { useGlyphSelection } from '~/components/compositions/glyph-selection-component';
import { useEventlibSelect } from '~/components/compositions/eventlib-select';

import {
  BBox,
} from "sharedLib";
import { useTextOverlay  } from '~/components/compositions/text-overlay';
import { prettyPrint } from '~/lib/pretty-print';
import { GridTypes } from 'sharedLib/dist';
import { TextStyle } from '~/lib/html-text-metrics';


const ProvidedTextgrid = 'ProvidedTextgrid';

export interface TextgridAndBounds {
  textgrid: GridTypes.Textgrid;
  pageBounds: BBox;
}

export type TextgridRef = Ref<TextgridAndBounds|null>;

export function provideTextGrid(t: TextgridRef): void {
  provide(ProvidedTextgrid, t)
}

export function injectTextGrid(): TextgridRef {
  return inject(ProvidedTextgrid, ref(null));
}

export default createComponent({
  setup() {
    const providedTextgridRef = injectTextGrid();

    const mountPoint: Ref<HTMLDivElement|null> = ref(null);
    const state = initState();

    const eventlibCore = useEventlibCore({ targetDivRef: mountPoint, state } );
    const superimposedElements = useSuperimposedElements({ includeElems: [ElementTypes.Canvas, ElementTypes.Text], mountPoint, state });
    const svgDrawTo = useSvgDrawTo({ containerRef: mountPoint, state });
    const eventlibSelect = useEventlibSelect({ eventlibCore, svgDrawTo, state });
    const glyphOverlays = useGlyphOverlays({ state, eventlibCore, svgDrawTo, superimposedElements });
    const textOverlay = useTextOverlay({ superimposedElements, state });

    const { putTextLn } = textOverlay;


    onMounted(() => {
      superimposedElements.setDimensions(600, 800);

      watch(providedTextgridRef, (providedTextgrid) => {

        if (providedTextgrid===null) return;
        const textgrid = providedTextgrid.textgrid;

        const size = 18;
        const style: TextStyle = {
          size,
          style: 'normal',
          family: 'arial',
          weight: 'normal'
        };

        const textDiv = superimposedElements.overlayElements.textDiv!;

        textDiv.style.visibility = 'hidden';
        let currY = 0;
        let maxWidth = 0;
        _.each(textgrid.rows, (row, rownum) => {
          const text = row.text;
          const lineDimensions = putTextLn(style, 0, currY, text);
          maxWidth = Math.max(maxWidth, lineDimensions.width);
          prettyPrint({ text, rownum, currY }, { colors: false });

          currY += size+2;
        });

        const widthSlopFactor = 20;
        textDiv.style.visibility = 'visible';
        superimposedElements.setDimensions(maxWidth+widthSlopFactor, currY+size);

      });

    });

    return {
      mountPoint
    };
  }
});
