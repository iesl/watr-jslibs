import _ from 'lodash';

import {
  Ref,
} from '@vue/composition-api';


import { StateArgs } from '~/components/compositions/component-basics'
import { useEventlibCore, EventlibCore } from '~/components/compositions/eventlib-core';
import { useImgCanvasOverlays, ImgCanvasOverlay } from '~/components/compositions/elem-overlays';
import { useCanvasDrawto, CanvasDrawto } from '~/components/compositions/drawto-canvas';

import { useGlyphOverlays, SetGrid } from '~/components/compositions/glyph-overlay-component';
import { useGlyphSelection } from '~/components/compositions/glyph-selection-component';
import { useEventlibSelect } from '~/components/compositions/eventlib-select';


type Args = StateArgs & {
  mountPoint: Ref<HTMLDivElement|null>;
};

export interface PdfPageViewer {
  eventlibCore: EventlibCore;
  imgCanvasOverlay: ImgCanvasOverlay;
  canvasDrawto: CanvasDrawto;
  setGrid: SetGrid;
}


export function usePdfPageViewer({
  mountPoint, state
}: Args): PdfPageViewer {
  // const containerRef = targetDivRef;

  const eventlibCore = useEventlibCore({ targetDivRef: mountPoint, state } );

  const imgCanvasOverlay = useImgCanvasOverlays({ mountPoint, state });
  const canvasRef = imgCanvasOverlay.elems.canvasElem;
  const canvasDrawto = useCanvasDrawto({ canvasRef, containerRef: mountPoint, state });
  const glyphOverlays = useGlyphOverlays({ state, eventlibCore, canvasDrawto, imgCanvasOverlay });
  const eventlibSelect = useEventlibSelect({ eventlibCore, canvasDrawto, state });
  const { rtreeSearch } = glyphOverlays;
  useGlyphSelection({ canvasDrawto, rtreeSearch, eventlibSelect, state });

  const setGrid = glyphOverlays.setGrid;

  return {
    eventlibCore,
    imgCanvasOverlay,
    canvasDrawto,
    setGrid
  }

}
