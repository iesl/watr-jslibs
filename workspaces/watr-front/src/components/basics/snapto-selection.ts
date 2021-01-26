/**
 * Given selection events and an rtree index, provide a way to
 * select a set of indexed items, with various constraints
 * - [x] Modify the selection rectangle to the min-bounding rectangle
 *       that contains all indexed shapes within the original selection rectangle
 *
 * - [ ] Ignore the indexed shapes and simply select the same region
 *       as specified in the original event
 * - [ ] (possible future feature) Select based on chars/lines, as in selecting
 *       a range of text
 */
import _ from 'lodash';

import {
  mk,
  BBox,
  MinMaxBox,
} from '~/lib/coord-sys';

import {
  watch,
} from '@vue/composition-api';

import { StateArgs, waitFor } from '~/components/basics/component-basics'
import { EventlibSelect } from '~/components/basics/eventlib-select';
// import { RTreeIndex } from '~/components/basics/rtree-search';
import { tweenBBox } from '~/lib/tweening';
// import { GlyphOverlay } from './glyph-overlays';


export interface SnaptoSelection {
}

type Args = StateArgs & {
  eventlibSelect: EventlibSelect;
  // rtreeIndex: RTreeIndex<GlyphOverlay>;
};


export function useSnaptoSelection({
  state,
  eventlibSelect,
  // rtreeIndex,
}: Args): SnaptoSelection {
  const { selectionRef } = eventlibSelect;

  waitFor('SnaptoSelection', {
    state,
    dependsOn: [],
  }, () => {

    // const pixiJsApp = pixiJsAppRef.value!;

    watch(selectionRef, () => {
      const selection = selectionRef.value!;
      // search for glyphs in selection box...
      // const selectedGlyphs = rtreeIndex.search(selection);
      // const minBounds = queryHitsMBR(selectedGlyphs);
      // const selectionRect = new PIXI.Graphics();
      // const lineColor = chroma('blue').num();
      // const fillColor = chroma('green').num();

      // if (minBounds) {
      //   const tweenPromise = tweenBBox(selection, minBounds, (currBBox) => {
      //     // selectionRect.drawRect(currBBox.x, currBBox.y, currBBox.width, currBBox.height);
      //   });

      //   tweenPromise.then(() => {
      //     // pixiJsApp.stage.removeChild(selectionRect);
      //   });
      // }
    });

  });

  return {};
}

/** return min-bounding rect for rtree search hits */
export function queryHitsMBR(hits: MinMaxBox[]): BBox | undefined {
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
