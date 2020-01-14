/**
 * Provides rtree-based hovering and search over given input shapes
 */

import _ from 'lodash';

import {
  watch,
} from '@vue/composition-api';



import * as d3 from 'd3';

import { StateArgs } from '~/components/basics/component-basics'
import { EventlibCore } from '~/components/basics/eventlib-core';
import { SuperimposedElements } from '~/components/basics/superimposed-elements';
import { useRTreeIndex, RTreeIndex } from '~/components/basics/rtree-search';
import { TextDataPoint } from '~/lib/TextGlyphDataTypes';
import { BBox, d3x } from 'sharedLib';

const { initStroke, initFill, initRect } = d3x;

export type SetGrid = (textData: TextDataPoint[], pageGeometry: BBox) => void;

export interface GlyphOverlays {
  setGrid: SetGrid;
  rtreeIndex: RTreeIndex<TextDataPoint>;
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

  const rtreeIndex = useRTreeIndex<TextDataPoint>({ state });

  const setGrid: SetGrid = (textData, geom) => {
    const pageGeometry = geom;
    const { width, height } = pageGeometry;

    superimposedElements.setDimensions(width, height);

    rtreeIndex.loadData(textData);
    const flashlight = rtreeIndex.flashlight(eventlibCore);

    const svgLayer = superimposedElements.overlayElements.svg!;
    const svgSelect = d3.select(svgLayer);
    watch(flashlight.litItemsRef, (litItems) => {
      const items = _.sortBy(
        _.filter(litItems, (hit) => hit.glyphData !== undefined),
        (hit) => [hit.minY, hit.minX]
      );

      svgSelect
        .selectAll('.litItems')
        .data(items, (d: any) => `${d.id}`)
        .join('rect')
        .classed('litItems', true)
        .call(initRect, (i: any) => i.glyphData.glyphBounds)
        .call(initStroke, 'blue', 1, 0.8)
        .call(initFill, 'yellow', 0.8)

    });
  }

  return {
    setGrid,
    rtreeIndex
  };

}
