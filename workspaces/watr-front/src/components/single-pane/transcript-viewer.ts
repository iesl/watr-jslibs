import _ from 'lodash';

import { Ref } from '@vue/composition-api';

import { StateArgs } from '~/components/basics/component-basics'
import { useEventlibCore } from '~/components/basics/eventlib-core';
import { useSuperimposedElements, ElementTypes } from '~/components/basics/superimposed-elements';
import { useSpatialSearch } from '~/components/basics/glyph-overlays';
import { useMeasuredTextOverlay  } from '~/components/basics/measured-text-overlay';
import { TextStyle } from '~/lib/html-text-metrics';
import { newIdGenerator } from '~/lib/utils';
import { RTreeIndexable } from '~/lib/TextGlyphDataTypes';
import * as Tr from '~/lib/transcript';



export interface TextgridAndBounds {
  // textgrid: GridTypes.Textgrid;
  trPage: Tr.Page;
  textMarginLeft: number;
  textMarginTop: number;
}

// const ProvidedTextgrid = 'ProvidedTextgrid';

export type SetText = (textAndBounds: TextgridAndBounds) => void;

type Args = StateArgs & {
  mountPoint: Ref<HTMLDivElement|null>;
};

export interface TranscriptViewer {
  setText: SetText;
}


export async function useTranscriptViewer({
  mountPoint, state
}: Args): Promise<TranscriptViewer> {

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

    const { trPage, textMarginTop, textMarginLeft } = textAndBounds;

    textDiv.style.visibility = 'hidden';

    // let currY = textMarginTop;
    // let maxWidth = 0;

    // const allIndexables = _.flatMap(trPage.lines, (line) => {
    //   const text = line.text;
    //   const lineDimensions = putTextLn(style, textMarginLeft, currY, text);
    //   maxWidth = Math.max(maxWidth, lineDimensions.width);
    //   const indexables: RTreeIndexable[] = lineDimensions
    //     .elementDimensions
    //     .map(textDimensions => {
    //       const { x, y, width, height } = textDimensions;
    //       return {
    //         id: nextId(),
    //         minX: x,
    //         minY: y,
    //         maxX: x + width,
    //         maxY: y + height
    //       };
    //     });

    //   currY += size+2;
    //   return indexables;
    // });

    // maxWidth += textMarginLeft*2;

    // spatialSearch.setGrid(allIndexables);
    // superimposedElements.setDimensions(maxWidth, currY+textMarginTop);
    textDiv.style.visibility = 'visible';
  };

  return {
    setText
  };
}
