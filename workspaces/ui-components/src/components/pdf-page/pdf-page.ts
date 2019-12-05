import _ from 'lodash';

import {
  Ref,
  ref,
  // watch,
} from '@vue/composition-api';

import chroma from 'chroma-js';
import * as PIXI from 'pixi.js';

import { StateArgs, waitFor } from '~/components/component-basics'
import { useEventlibCore, EventlibCore } from '~/components/eventlib-core';
import { useImgCanvasOverlays, ImgCanvasOverlay } from '~/components/elem-overlays';
import { useCanvasDrawto, CanvasDrawto } from '~/components/drawto-canvas';
import { useRTreeSearch } from '~/components/rtree-search';
import { GridData, initGridData, gridDataToGlyphData, TextDataPoint } from '~/lib/TextGlyphDataTypes';
import { GridTypes, Point, coords } from 'sharedLib';
import { EMouseEvent, MouseHandlerInit } from '~/lib/EventlibHandlers';

type Args = StateArgs & {
  targetDivRef: Ref<HTMLDivElement>
};

export interface PdfPageViewer {
  eventlibCore: EventlibCore;
  imgCanvasOverlay: ImgCanvasOverlay;
  canvasDrawto: CanvasDrawto;
  setGrid: SetGrid;
}

type SetGrid = (grid: GridTypes.Grid, page: number) => void;

export interface GlyphOverlays {
  setGrid: SetGrid;
}

type GlyphOverlayArgs = StateArgs & {
  eventlibCore: EventlibCore;
  canvasDrawto: CanvasDrawto;
};

export function useGlyphOverlays({
  state,
  eventlibCore,
  canvasDrawto
}: GlyphOverlayArgs): GlyphOverlays {
  // TODO: setHoveredText
  // TODO: setClickedText
  const textgridRef: Ref<GridTypes.Grid> = ref(null)
  const pageNumRef: Ref<number> = ref(null);
  const rtreeSearch = useRTreeSearch<TextDataPoint>({ state });

  const { pixiJsAppRef } = canvasDrawto;
  const setGrid: SetGrid = (grid, page) => {
    console.log('useGlyphOverlays: setGrid');
    textgridRef.value = grid;
    pageNumRef.value = page;
  }

  waitFor('GlyphOverlays', {
    state,
    dependsOn: [textgridRef, pageNumRef, pixiJsAppRef],
  }, () => {

    const pixiJsApp = pixiJsAppRef.value;

    // TODO: don't make glyph data overlays depend on textgrid data loading
    const pageNum = pageNumRef.value;
    const textgrid = textgridRef.value;
    const page = textgrid.pages[pageNum];
    const pageGrid = page.textgrid;

    // TODO: why is this margin here? hardcoded?
    const tmpPageMargin = 10;
    const origin = new Point(tmpPageMargin, tmpPageMargin, coords.CoordSys.GraphUnits);
    const gridData: GridData = initGridData(pageGrid, pageNum, _ => 10, origin, 10);
    const glyphData = gridDataToGlyphData(gridData.textDataPoints);
    rtreeSearch.loadData(glyphData);

    const onMouseMove = (e: EMouseEvent) => {
      const pos = e.pos;
      const mousePt = coords.mkPoint.fromXy(pos.x, pos.y);
      const queryBox = coords.boxCenteredAt(mousePt, 8, 8);
      const hits = rtreeSearch.search(queryBox);
      // console.log('hits', hits);
      const queryHits = _.sortBy(
        _.filter(hits, (hit) => hit.glyphData !== undefined),
        (hit) => [hit.minY, hit.minX]
      );

      // Show hit reticles:
      const selectLineColor = chroma('blue').darken().num();

      _.map(queryHits, (q) => {
        const pgRect = new PIXI.Graphics();
        pgRect.lineStyle(2, selectLineColor);
        const box = q.glyphData.glyphBounds;
        pgRect.drawRect(box.x, box.y, box.width, box.height);
        pixiJsApp.stage.addChild(pgRect)
      });

    }
    const glyphHandlers: MouseHandlerInit = () =>  {
      return {
        mousemove   : onMouseMove,
      }
    }

    eventlibCore.setMouseHandlers([glyphHandlers]);
  });

  return {
    setGrid
  };

}

export function usePdfPageViewer({
  targetDivRef, state
}: Args): PdfPageViewer {
  const containerRef = targetDivRef;

  const eventlibCore = useEventlibCore({ targetDivRef, state } );

  const imgCanvasOverlay = useImgCanvasOverlays({ containerRef, state });
  const canvasRef = imgCanvasOverlay.elems.canvasElem;
  const canvasDrawto = useCanvasDrawto({ canvasRef, containerRef, state });
  const glyphOverlays = useGlyphOverlays({ state, eventlibCore, canvasDrawto });

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
