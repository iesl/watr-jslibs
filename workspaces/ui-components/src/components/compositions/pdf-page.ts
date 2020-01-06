import _ from 'lodash';

import {
  Ref,
} from '@vue/composition-api';


import { StateArgs } from '~/components/compositions/component-basics'
import { useEventlibCore, EventlibCore } from '~/components/compositions/eventlib-core';
// import { useSuperimposedElements, ElementTypes } from '~/components/compositions/superimposed-elements';
import { useSuperimposedElements, SuperimposedElements, ElementTypes } from '~/components/compositions/superimposed-elements';
import { useSvgDrawTo, SvgDrawTo } from '~/components/compositions/svg-drawto';

import { useGlyphOverlays, SetGrid } from '~/components/compositions/glyph-overlay-component';
import { useGlyphSelection } from '~/components/compositions/glyph-selection-component';
import { useEventlibSelect } from '~/components/compositions/eventlib-select';


type Args = StateArgs & {
  mountPoint: Ref<HTMLDivElement|null>;
};

export interface PdfPageViewer {
  eventlibCore: EventlibCore;
  superimposedElements: SuperimposedElements;
  svgDrawTo: SvgDrawTo;
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

  const canvas = superimposedElements.overlayElements.canvas!;
  const svgDrawTo = useSvgDrawTo({ canvas, containerRef: mountPoint, state });
  const glyphOverlays = useGlyphOverlays({ state, eventlibCore, svgDrawTo, superimposedElements });
  const eventlibSelect = useEventlibSelect({ eventlibCore, svgDrawTo, state });
  const { rtreeSearch } = glyphOverlays;
  useGlyphSelection({ svgDrawTo, rtreeSearch, eventlibSelect, state });

  const setGrid = glyphOverlays.setGrid;

  return {
    eventlibCore,
    superimposedElements,
    svgDrawTo,
    setGrid
  }

}
