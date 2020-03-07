import _ from 'lodash';

import {
  Ref,
  // SetupContext,
} from '@vue/composition-api';


import { GetterTree, MutationTree, ActionTree, Plugin } from 'vuex'

import { StateArgs } from '~/components/basics/component-basics'
import { useEventlibCore, EventlibCore } from '~/components/basics/eventlib-core';
import { useSuperimposedElements, SuperimposedElements, ElementTypes } from '~/components/basics/superimposed-elements';

import { useGlyphOverlays, SetGrid } from '~/components/basics/glyph-overlays';
import { useSnaptoSelection } from '~/components/basics/snapto-selection';
import { useEventlibSelect } from '~/components/basics/eventlib-select';


type Args = StateArgs & {
  mountPoint: Ref<HTMLDivElement|null>;
};

export interface PdfPageViewer {
  eventlibCore: EventlibCore;
  superimposedElements: SuperimposedElements;
  setGrid: SetGrid;
}


export function usePdfPageViewer({
  mountPoint, state
}: Args): PdfPageViewer {

  const eventlibCore = useEventlibCore({ targetDivRef: mountPoint, state } );

  const superimposedElements = useSuperimposedElements({
    includeElems: [ElementTypes.Img, ElementTypes.Svg],
    mountPoint, state
  });

  const glyphOverlays = useGlyphOverlays({ state, eventlibCore, superimposedElements });
  const eventlibSelect = useEventlibSelect({ eventlibCore, superimposedElements, state });
  const { rtreeIndex } = glyphOverlays;
  useSnaptoSelection({ rtreeIndex, eventlibSelect, state });

  const setGrid = glyphOverlays.setGrid;

  return {
    eventlibCore,
    superimposedElements,
    setGrid
  }
}


interface PdfPageViewerState {
  drawables: object[];
}

export interface StateModule<S> {
  state: () => S;
  actions?: ActionTree<S, any>;
  mutations?: MutationTree<S>;
  getters?: GetterTree<S, any>;
  plugins?: Plugin<S>[];
}

export type StateModuleP<S> = Partial<StateModule<S>>;

export const PdfPageViewerModule: StateModule<PdfPageViewerState> = {
  state: () => ({
    drawables: []

  }),
}

export function useTracelogPdfPageViewer({
  mountPoint, state
}: Args): PdfPageViewer {
  const eventlibCore = useEventlibCore({ targetDivRef: mountPoint, state } );

  const superimposedElements = useSuperimposedElements({
    includeElems: [ElementTypes.Img, ElementTypes.Svg],
    mountPoint, state
  });

  const glyphOverlays = useGlyphOverlays({ state, eventlibCore, superimposedElements });
  const eventlibSelect = useEventlibSelect({ eventlibCore, superimposedElements, state });
  const { rtreeIndex } = glyphOverlays;
  useSnaptoSelection({ rtreeIndex, eventlibSelect, state });

  const setGrid = glyphOverlays.setGrid;

  // Inputs:
  //  - shape drawing/clearing over image
  //  - focus points/hovered glyphs (in pdf text viewer, indicate corresponding point on pdf page image)
  // Outputs:
  //  - rectangular selection for narrowing tracelog view area
  //  - clicked point

  return {
    eventlibCore,
    superimposedElements,
    setGrid
  }
}

export default {
  // setup() {}
}
