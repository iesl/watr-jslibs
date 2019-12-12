import _ from 'lodash';

import {
  Ref,
} from '@vue/composition-api';


import { StateArgs, waitFor } from '~/components/component-basics'
import { useEventlibCore, EventlibCore } from '~/components/eventlib-core';
import { useImgCanvasOverlays, ImgCanvasOverlay } from '~/components/elem-overlays';
import { useCanvasDrawto, CanvasDrawto } from '~/components/drawto-canvas';
import { useGlyphOverlays, SetGrid } from './glyph-overlay-component';
import { useGlyphSelection } from './glyph-selection-component';
import { useEventlibSelect } from '../eventlib-select';


type Args = StateArgs & {
  targetDivRef: Ref<HTMLDivElement|null>;
};

export interface PdfPageViewer {
  eventlibCore: EventlibCore;
  imgCanvasOverlay: ImgCanvasOverlay;
  canvasDrawto: CanvasDrawto;
  setGrid: SetGrid;
}

// type SetGrid = (grid: GridTypes.Grid, page: number) => void;



export function usePdfPageViewer({
  targetDivRef, state
}: Args): PdfPageViewer {
  const containerRef = targetDivRef;

  const eventlibCore = useEventlibCore({ targetDivRef, state } );

  const imgCanvasOverlay = useImgCanvasOverlays({ containerRef, state });
  const canvasRef = imgCanvasOverlay.elems.canvasElem;
  const canvasDrawto = useCanvasDrawto({ canvasRef, containerRef, state });
  const glyphOverlays = useGlyphOverlays({ state, eventlibCore, canvasDrawto, imgCanvasOverlay });
  const eventlibSelect = useEventlibSelect({ eventlibCore, canvasDrawto, state });
  const { rtreeSearch } = glyphOverlays;
  useGlyphSelection({ canvasDrawto, rtreeSearch, eventlibSelect, state });

  const setGrid = glyphOverlays.setGrid;

  waitFor('PdfPageViewer', {
    state,
  }, () => {

  });

  return {
    eventlibCore,
    imgCanvasOverlay,
    canvasDrawto,
    setGrid
  }

}
