
import _ from 'lodash';

import {
  mk,
  BBox,
} from "sharedLib";

import {
  watch,
} from '@vue/composition-api';

import { StateArgs, waitFor } from '~/components/component-basics'
import { EventlibSelect } from '../eventlib-select';
import { RTreeSearch } from '~/components/rtree-search';
import { TextDataPoint } from '~/lib/TextGlyphDataTypes';
import { tweenBBox } from '~/lib/tweening';

import chroma from 'chroma-js';
import * as PIXI from 'pixi.js';
import { CanvasDrawto } from '../drawto-canvas';

export interface GlyphSelection {
}

type Args = StateArgs & {
  eventlibSelect: EventlibSelect;
  rtreeSearch: RTreeSearch<TextDataPoint>;
  canvasDrawto: CanvasDrawto;
  // imgCanvasOverlay: ImgCanvasOverlay;
};


export function useGlyphSelection({
  state,
  eventlibSelect,
  rtreeSearch,
  canvasDrawto,
}: Args): GlyphSelection {
  const { selectionRef } = eventlibSelect;

  const { pixiJsAppRef } = canvasDrawto;

  waitFor('GlyphSelection', {
    state,
    dependsOn: [pixiJsAppRef],
  }, () => {

    const pixiJsApp = pixiJsAppRef.value!;

    watch(selectionRef, () => {
      const selection = selectionRef.value!;
      // search for glyphs in selection box...
      const selectedGlyphs = rtreeSearch.search(selection);
      const minBounds = queryHitsMBR(selectedGlyphs);
      console.log(`got sel ${selection}, minBound=${minBounds}`)
      const selectionRect = new PIXI.Graphics();
      const lineColor = chroma('blue').num();
      const fillColor = chroma('green').num();

      if (minBounds) {
        pixiJsApp.stage.addChild(selectionRect);
        const tweenPromise = tweenBBox(selection, minBounds, (currBBox) => {
          selectionRect.clear();
          selectionRect.lineStyle(1, lineColor);
          selectionRect.beginFill(fillColor, 0.4);
          selectionRect.drawRect(currBBox.x, currBBox.y, currBBox.width, currBBox.height);
          selectionRect.endFill();
        });

        tweenPromise.then(() => {

          pixiJsApp.stage.removeChild(selectionRect);
        });
      }



      // let minBoundSelection = rtrees.queryHitsMBR(hits);
      // tween bbox down to min-rect
    });

  });

  return {

  };
}

/** return min-bounding rect for rtree search hits */
export function queryHitsMBR(hits: TextDataPoint[]): BBox | undefined {
  if (hits.length === 0 ) {
    return undefined;
  }
  const minX = _.min(_.map(hits, 'minX'));
  const maxX = _.max(_.map(hits, 'maxX'));
  const minY = _.min(_.map(hits, 'minY'));
  const maxY = _.max(_.map(hits, 'maxY'));
  const width = maxX! - minX!;
  const height = maxY! - minY!;

  return mk.fromLtwh(minX!, minY!, width, height);

}
