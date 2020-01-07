import _ from 'lodash';

import {
  Ref,
} from '@vue/composition-api';


import { StateArgs } from '~/components/compositions/component-basics'
import { useEventlibCore, EventlibCore } from '~/components/compositions/eventlib-core';
// import { useSuperimposedElements, ElementTypes } from '~/components/compositions/superimposed-elements';
import { useSuperimposedElements, SuperimposedElements, ElementTypes } from '~/components/compositions/superimposed-elements';

import { useGlyphOverlays, SetGrid } from '~/components/compositions/glyph-overlay-component';
import { useGlyphSelection } from '~/components/compositions/glyph-selection-component';
import { useEventlibSelect } from '~/components/compositions/eventlib-select';


type Args = StateArgs & {
  mountPoint: Ref<HTMLDivElement|null>;
};

export interface PdfPageViewer {
  eventlibCore: EventlibCore;
  superimposedElements: SuperimposedElements;
  setGrid: SetGrid;
}


export function usePdfPageViewer({
  mountPoint, state
}: Args): PdfPageViewer {
  // const containerRef = targetDivRef;

  const eventlibCore = useEventlibCore({ targetDivRef: mountPoint, state } );

  const superimposedElements = useSuperimposedElements({
    includeElems: [ElementTypes.Img, ElementTypes.Canvas],
    mountPoint, state
  });

  const glyphOverlays = useGlyphOverlays({ state, eventlibCore, superimposedElements });
  const eventlibSelect = useEventlibSelect({ eventlibCore, state });
  const { rtreeSearch } = glyphOverlays;
  useGlyphSelection({ rtreeSearch, eventlibSelect, state });

  const setGrid = glyphOverlays.setGrid;

  return {
    eventlibCore,
    superimposedElements,
    setGrid
  }

}
