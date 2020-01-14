import _ from 'lodash';

import { ref, watch, Ref, createComponent, inject, onMounted, provide  } from '@vue/composition-api';

import { StateArgs } from '~/components/basics/component-basics'
import { initState } from '~/components/basics/component-basics'
import { useEventlibCore } from '~/components/basics/eventlib-core';
import { useSuperimposedElements, ElementTypes } from '~/components/basics/superimposed-elements';
import { useGlyphOverlays } from '~/components/basics/glyph-overlays';
import { useEventlibSelect } from '~/components/basics/eventlib-select';
import { BBox, GridTypes } from "sharedLib";
import { useTextOverlay  } from '~/components/basics/text-overlay';
import { TextStyle } from '~/lib/html-text-metrics';



export interface TextgridAndBounds {
  textgrid: GridTypes.Textgrid;
  pageBounds: BBox;
}

// const ProvidedTextgrid = 'ProvidedTextgrid';
// export type TextgridRef = Ref<TextgridAndBounds|null>;

// export function provideTextGrid(t: TextgridRef): void {
//   provide(ProvidedTextgrid, t)
// }

// export function injectTextGrid(): TextgridRef {
//   return inject(ProvidedTextgrid, ref(null));
// }

export type SetText = (textAndBounds: TextgridAndBounds) => void;

type Args = StateArgs & {
  mountPoint: Ref<HTMLDivElement|null>;
};

export interface PdfTextViewer {
  setText: SetText;
}


export function usePdfTextViewer({
  mountPoint, state
}: Args): PdfTextViewer {

  const eventlibCore = useEventlibCore({ targetDivRef: mountPoint, state } );
  const superimposedElements = useSuperimposedElements({ includeElems: [ElementTypes.Canvas, ElementTypes.Text], mountPoint, state });
  useEventlibSelect({ superimposedElements, eventlibCore, state });
  useGlyphOverlays({ state, eventlibCore, superimposedElements });
  const textOverlay = useTextOverlay({ superimposedElements, state });

  const { putTextLn } = textOverlay;


  const setText: SetText = (textAndBounds) => {
    superimposedElements.setDimensions(600, 800);


    const { textgrid } = textAndBounds;

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
    _.each(textgrid.rows, (row) => {
      const text = row.text;
      const lineDimensions = putTextLn(style, 0, currY, text);
      maxWidth = Math.max(maxWidth, lineDimensions.width);

      currY += size+2;
    });

    const widthSlopFactor = 20;
    textDiv.style.visibility = 'visible';
    superimposedElements.setDimensions(maxWidth+widthSlopFactor, currY+size);

  };

  return {
    setText
  };

}
