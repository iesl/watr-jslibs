import _ from 'lodash';

import {
  Ref,
} from '@vue/composition-api';


import { StateArgs } from '~/components/basics/component-basics'
import { useEventlibCore, EventlibCore } from '~/components/basics/eventlib-core';
// import { useSuperimposedElements, ElementTypes } from '~/components/basics/superimposed-elements';
import { useSuperimposedElements, SuperimposedElements, ElementTypes } from '~/components/basics/superimposed-elements';

import { useGlyphOverlays, SetGrid } from '~/components/basics/glyph-overlay-component';
import { useGlyphSelection } from '~/components/basics/glyph-selection-component';
import { useEventlibSelect } from '~/components/basics/eventlib-select';


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

  const eventlibCore = useEventlibCore({ targetDivRef: mountPoint, state } );

  const superimposedElements = useSuperimposedElements({
    includeElems: [ElementTypes.Img, ElementTypes.Svg],
    mountPoint, state
  });

  const glyphOverlays = useGlyphOverlays({ state, eventlibCore, superimposedElements });
  const eventlibSelect = useEventlibSelect({ eventlibCore, superimposedElements, state });
  const { rtreeSearch } = glyphOverlays;
  useGlyphSelection({ rtreeSearch, eventlibSelect, state });

  const setGrid = glyphOverlays.setGrid;

  return {
    eventlibCore,
    superimposedElements,
    setGrid
  }

}
