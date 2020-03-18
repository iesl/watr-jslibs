import _ from 'lodash';

import { Ref } from '@vue/composition-api';

import { StateArgs, awaitRef } from '~/components/basics/component-basics'
// import { initState } from '~/components/basics/component-basics'
import { useEventlibCore } from '~/components/basics/eventlib-core';
import { useSuperimposedElements, ElementTypes } from '~/components/basics/superimposed-elements';
import { useSpatialSearch } from '~/components/basics/glyph-overlays';
import { useEventlibSelect } from '~/components/basics/eventlib-select';
import { BBox } from '~/lib/coord-sys';
import * as GridTypes from '~/lib/TextGridTypes';
import { useMeasuredTextOverlay  } from '~/components/basics/measured-text-overlay';
import { TextStyle } from '~/lib/html-text-metrics';
import { newIdGenerator } from '~/lib/utils';
import { RTreeIndexable } from '~/lib/TextGlyphDataTypes';


export interface TextgridAndBounds {
  textgrid: GridTypes.Textgrid;
  pageBounds: BBox;
}

// const ProvidedTextgrid = 'ProvidedTextgrid';

export type SetText = (textAndBounds: TextgridAndBounds) => void;

type Args = StateArgs & {
  mountPoint: Ref<HTMLDivElement|null>;
};

export interface PdfTextViewer {
  setText: SetText;
}


export async function usePdfTextViewer({
  mountPoint, state
}: Args): Promise<PdfTextViewer> {

  const eventlibCore = await useEventlibCore({ targetDivRef: mountPoint, state } );
  const superimposedElements = useSuperimposedElements({ includeElems: [ElementTypes.Text, ElementTypes.Svg], mountPoint, state });
  const spatialSearch = useSpatialSearch({ state, eventlibCore, superimposedElements });

  const { putTextLn } = useMeasuredTextOverlay({ superimposedElements, state });
  const textDiv = superimposedElements.overlayElements.textDiv!;
  const nextId = newIdGenerator();

  const size = 15;
  const style: TextStyle = {
    size,
    style: 'normal',
    family: 'arial',
    weight: 'normal'
  };

  const setText: SetText = (textAndBounds) => {

    const { textgrid, pageBounds } = textAndBounds;
    const pageLeft = pageBounds.left;
    const pageTop = pageBounds.top;

    textDiv.style.visibility = 'hidden';

    let currY = pageTop;
    let maxWidth = 0;
    const allIndexables = _.flatMap(textgrid.rows, (row) => {
      const text = row.text;
      const lineDimensions = putTextLn(style, pageLeft, currY, text);
      maxWidth = Math.max(maxWidth, lineDimensions.width);
      const indexables: RTreeIndexable[] = lineDimensions
        .elementDimensions
        .map(textDimensions => {
          const { x, y, width, height } = textDimensions;
          return {
            id: nextId(),
            minX: x,
            minY: y,
            maxX: x + width,
            maxY: y + height
          };
        });

      currY += size+2;
      return indexables;
    });

    maxWidth += pageLeft*2;

    spatialSearch.setGrid(allIndexables);
    superimposedElements.setDimensions(maxWidth, currY+pageTop);
    textDiv.style.visibility = 'visible';
  };

  return {
    setText
  };
}
