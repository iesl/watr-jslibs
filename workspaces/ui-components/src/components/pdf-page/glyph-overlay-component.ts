
import _ from 'lodash';

import {
  Ref,
  ref,
  // watch,
} from '@vue/composition-api';


import chroma from 'chroma-js';
import * as PIXI from 'pixi.js';

import { StateArgs, waitFor } from '~/components/component-basics'
import { EventlibCore } from '~/components/eventlib-core';
import { ImgCanvasOverlay } from '~/components/elem-overlays';
import { CanvasDrawto } from '~/components/drawto-canvas';
import { useRTreeSearch, RTreeSearch } from '~/components/rtree-search';
import { GridData, initGridData, gridDataToGlyphData, TextDataPoint } from '~/lib/TextGlyphDataTypes';
import { GridTypes, Point, coords } from 'sharedLib';
import { EMouseEvent, MouseHandlerInit } from '~/lib/EventlibHandlers';

export type SetGrid = (grid: GridTypes.Grid, page: number) => void;

export interface GlyphOverlays {
  setGrid: SetGrid;
  rtreeSearch: RTreeSearch<TextDataPoint>;
}

type Args = StateArgs & {
  eventlibCore: EventlibCore;
  canvasDrawto: CanvasDrawto;
  imgCanvasOverlay: ImgCanvasOverlay;
};

export function useGlyphOverlays({
  state,
  eventlibCore,
  canvasDrawto,
  imgCanvasOverlay,
}: Args): GlyphOverlays {
  // TODO: setHoveredText
  // TODO: setClickedText
  const textgridRef: Ref<GridTypes.Grid|null> = ref(null)
  const pageNumRef: Ref<number|null> = ref(null);
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

    const pixiJsApp = pixiJsAppRef.value!;

    // TODO: don't make glyph data overlays depend on textgrid data loading
    const pageNum = pageNumRef.value!;
    const textgrid = textgridRef.value!;
    const page = textgrid.pages[pageNum];
    const [l, t, w, h] = page.pageGeometry;
    const pageBounds = coords.mk.fromArray([l, t, w, h]);
    const width = pageBounds.width;
    const height = pageBounds.height;
    imgCanvasOverlay.setDimensions(width, height);

    const pageGrid = page.textgrid;

    // TODO: why is this margin here? hardcoded?
    const tmpPageMargin = 10;
    const origin = new Point(tmpPageMargin, tmpPageMargin, coords.CoordSys.GraphUnits);
    const gridData: GridData = initGridData(pageGrid, pageNum, _ => 10, origin, 10);
    const glyphData = gridDataToGlyphData(gridData.textDataPoints);
    rtreeSearch.loadData(glyphData);

    // TODO recycle these graphics objects to avoid memory issues
    let glyphReticles: PIXI.Graphics[] = [];

    const onMouseMove = (e: EMouseEvent) => {
      const pos = e.pos;
      const mousePt = coords.mkPoint.fromXy(pos.x, pos.y);
      const queryBox = coords.boxCenteredAt(mousePt, 8, 8);
      const hits = rtreeSearch.search(queryBox);
      const queryHits = _.sortBy(
        _.filter(hits, (hit) => hit.glyphData !== undefined),
        (hit) => [hit.minY, hit.minX]
      );

      // Show hit reticles:
      const selectLineColor = chroma('gray').num();
      pixiJsApp.stage.removeChild(...glyphReticles);
      glyphReticles = [];

      _.each(queryHits, (q) => {
        const glyphData = q.glyphData;
        if (glyphData) {
          const box = glyphData.glyphBounds;
          const pgRect = new PIXI.Graphics();
          pgRect.lineStyle(1, selectLineColor);
          pgRect.drawRect(box.x, box.y, box.width, box.height);
          pixiJsApp.stage.addChild(pgRect)
          glyphReticles.push(pgRect);
        }
      });
      // glyphReticles = _.map(queryHits, (q) => {
      //   const glyphData = q.glyphData;
      //   if (glyphData) {
      //     const box = glyphData.glyphBounds;
      //     const pgRect = new PIXI.Graphics();
      //     pgRect.lineStyle(1, selectLineColor);
      //     pgRect.drawRect(box.x, box.y, box.width, box.height);
      //     pixiJsApp.stage.addChild(pgRect)
      //     return pgRect;
      //   }
      //   return undefined;
      // });

    }
    const glyphHandlers: MouseHandlerInit = () =>  {
      return {
        mousemove   : onMouseMove,
      }
    }

    eventlibCore.setMouseHandlers([glyphHandlers]);
  });

  return {
    setGrid,
    rtreeSearch
  };

}
