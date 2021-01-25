/**
 * Provides rtree-based hovering and search over given input shapes
 */

import _ from 'lodash';

import {
  watch,
} from '@vue/composition-api';


import * as d3 from 'd3-selection';

import { StateArgs } from '~/components/basics/component-basics'
import { EventlibCore } from '~/components/basics/eventlib-core';
import { SuperimposedElements } from '~/components/basics/superimposed-elements';
import { useRTreeIndex, RTreeIndex } from '~/components/basics/rtree-search';

import { RTreeIndexable } from '~/lib/transcript/TextGlyphDataTypes';
import * as d3x from '~/lib/d3-extras';
import { Glyph } from '~/lib/transcript/glyph';

const { initStroke, initFill, initRect } = d3x;
import {
  mk,
} from '~/lib/coord-sys'
import { Rect } from '~/lib/transcript/shapes';


export interface GlyphOverlay extends RTreeIndexable {
  glyph: Glyph;
}

export type SetGlyphOverlays = (glyphs: Glyph[], pageGeometry: Rect) => void;
export interface GlyphOverlays {
  setGlyphOverlays: SetGlyphOverlays;
  rtreeIndex: RTreeIndex<GlyphOverlay>;
}

type Args = StateArgs & {
  eventlibCore: EventlibCore;
  superimposedElements: SuperimposedElements;
};

export function useGlyphOverlays({
  state,
  eventlibCore,
  superimposedElements,
}: Args): GlyphOverlays {
  // TODO: setHoveredText (for highlighting sync-highlighting text on pdf-text widget)
  // TODO: setClickedText (for synching pdf page text w/ image)

  const rtreeIndex = useRTreeIndex<GlyphOverlay>({ state });

  const setGlyphOverlays: SetGlyphOverlays = (glyphs, geom) => {
    const pageGeometry = geom;
    const { width, height } = pageGeometry;

    superimposedElements.setDimensions(width, height);
    const glyphOverlays: GlyphOverlay[] = _.map(glyphs, (glyph) => {
      const { x, y, width, height } = glyph.rect;
      const charBounds = mk.fromLtwh(x, y, width, height);
      const { minX, minY, maxX, maxY } = charBounds;
      const glyphOverlay: GlyphOverlay = {
        glyph,
        id: glyph.id,
        minX, minY, maxX, maxY
      };
      return glyphOverlay;
    });

    rtreeIndex.loadData(glyphOverlays);
    const flashlight = rtreeIndex.flashlight(eventlibCore);

    const svgLayer = superimposedElements.overlayElements.svg!;
    const svgSelect = d3.select(svgLayer);
    watch(flashlight.litItemsRef, (litItems) => {
      const items = _.sortBy(
        _.filter(litItems, (hit: GlyphOverlay) => hit.glyph !== undefined),
        (hit) => [hit.minY, hit.minX]
      );

      svgSelect
        .selectAll('.litItems')
        .data(items, (d: any) => `${d.id}`)
        .join('rect')
        .classed('litItems', true)
        .call(initRect, (i: any) => i.glyph.rect)
        .call(initStroke, 'blue', 1, 0.8)
        .call(initFill, 'yellow', 0.8);

    });
  }

  return {
    setGlyphOverlays,
    rtreeIndex
  };

}
