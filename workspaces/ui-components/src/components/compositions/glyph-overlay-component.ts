/**
 * Provides rtree-based hovering and search over given input shapes
 */

import _ from 'lodash';

import {
  Ref,
  ref,
} from '@vue/composition-api';


import chroma from 'chroma-js';
import * as PIXI from 'pixi.js';

import { StateArgs, waitFor } from '~/components/compositions/component-basics'
import { EventlibCore } from '~/components/compositions/eventlib-core';
import { ImgCanvasOverlay } from '~/components/compositions/elem-overlays';
import { CanvasDrawto } from '~/components/compositions/drawto-canvas';
import { useRTreeSearch, RTreeSearch } from '~/components/compositions/rtree-search';
import { TextDataPoint } from '~/lib/TextGlyphDataTypes';
import { coords, BBox } from 'sharedLib';
import { EMouseEvent, MouseHandlerInit } from '~/lib/EventlibHandlers';

export type SetGrid = (textData: TextDataPoint[], pageGeometry: BBox) => void;

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
  // TODO: setHoveredText (for highlighting sync-highlighting text on pdf-text widget)
  // TODO: setClickedText (for synching pdf page text w/ image)

  const textDataPointsRef: Ref<TextDataPoint[]|null> = ref(null)
  let pageGeometry: BBox;
  const rtreeSearch = useRTreeSearch<TextDataPoint>({ state });

  const { pixiJsAppRef } = canvasDrawto;
  const setGrid: SetGrid = (textData, geom) => {
    pageGeometry = geom;
    textDataPointsRef.value = textData;
  }

  waitFor('GlyphOverlays', {
    state,
    dependsOn: [textDataPointsRef, pixiJsAppRef],
  }, () => {

    const pixiJsApp = pixiJsAppRef.value!;
    const textData = textDataPointsRef.value!;

    const width = pageGeometry.width;
    const height = pageGeometry.height;
    imgCanvasOverlay.setDimensions(width, height);

    rtreeSearch.loadData(textData);

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
