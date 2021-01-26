import _ from 'lodash';

import {
  Ref,
  watch,
} from '@vue/composition-api';

import { GetterTree, MutationTree, ActionTree, Plugin } from 'vuex'

import { StateArgs } from '~/components/basics/component-basics'
import { useEventlibCore, EventlibCore } from '~/components/basics/eventlib-core';
import { useSuperimposedElements, SuperimposedElements, ElementTypes } from '~/components/basics/superimposed-elements';


import { useGlyphOverlays} from '~/components/basics/glyph-overlays';
import { useSnaptoSelection } from '~/components/basics/snapto-selection';
import { useEventlibSelect } from '~/components/basics/eventlib-select';
import { resolveCorpusUrl } from '~/lib/axios';
import { LogEntry } from '~/lib/transcript/tracelogs';
import { fromFigure } from '~/lib/coord-sys';
import * as d3 from 'd3-selection';
import { TranscriptIndex } from '~/lib/transcript/transcript-index';


type Args = StateArgs & {
  mountPoint: Ref<HTMLDivElement | null>;
  transcriptIndex: TranscriptIndex;
  pageNumber: number;
  entryId: string;
  logEntryRef: Ref<LogEntry[]>;
};

export interface PdfPageViewer {
  eventlibCore: EventlibCore;
  superimposedElements: SuperimposedElements;
}

export async function usePdfPageViewer({
  mountPoint, state,
  transcriptIndex,
  pageNumber
}: Args): Promise<PdfPageViewer> {

  const eventlibCore = await useEventlibCore({ targetDivRef: mountPoint, state });

  const superimposedElements = useSuperimposedElements({
    includeElems: [ElementTypes.Img, ElementTypes.Svg],
    mountPoint, state
  });

  const glyphOverlays = useGlyphOverlays({ state, eventlibCore, superimposedElements, transcriptIndex, pageNumber });
  // const eventlibSelect = useEventlibSelect({ eventlibCore, superimposedElements, state });
  // const { rtreeIndex } = glyphOverlays;
  // useSnaptoSelection({ rtreeIndex, eventlibSelect, state });
  // const bounds = mk.fromArray(pageBounds);
  // superimposedElements.setDimensions(pageBounds.width, pageBounds.height);


  // const setGlyphOverlays = glyphOverlays.setGlyphOverlays;

  return {
    eventlibCore,
    superimposedElements,
  }
}

// interface PdfPageViewerState {
//   drawables: object[];
// }

// export interface StateModule<S> {
//   state: () => S;
//   actions?: ActionTree<S, any>;
//   mutations?: MutationTree<S>;
//   getters?: GetterTree<S, any>;
//   plugins?: Plugin<S>[];
// }

// export type StateModuleP<S> = Partial<StateModule<S>>;

// export const PdfPageViewerModule: StateModule<PdfPageViewerState> = {
//   state: () => ({
//     drawables: []
//   }),
// }

// TODO pull out all of the tracelog drawing code from useTracelogPdfPageViewer into it's own package
export async function useTracelogPdfPageViewer({
  mountPoint,
  transcriptIndex,
  pageNumber,
  entryId,
  logEntryRef,
  state
}: Args): Promise<PdfPageViewer> {
  return usePdfPageViewer({ entryId, logEntryRef, state, mountPoint, transcriptIndex, pageNumber, })
  // const eventlibCore = await useEventlibCore({ targetDivRef: mountPoint, state });

  // const superimposedElements = useSuperimposedElements({
  //   includeElems: [ElementTypes.Img, ElementTypes.Svg],
  //   mountPoint, state
  // });

  // const page = `${pageNumber + 1}`;
  // const imageUrl = resolveCorpusUrl(entryId, 'image', page);
  // superimposedElements.setImageSource(imageUrl);

  // const glyphOverlays = useGlyphOverlays({ state, eventlibCore, superimposedElements });
  // const eventlibSelect = useEventlibSelect({ eventlibCore, superimposedElements, state });
  // const { rtreeIndex } = glyphOverlays;
  // useSnaptoSelection({ rtreeIndex, eventlibSelect, state });

  // const setGlyphOverlays = glyphOverlays.setGlyphOverlays;
  // const svg = superimposedElements.overlayElements.svg!;

  // superimposedElements.setDimensions(pageBounds.width, pageBounds.height);
  // watch(logEntryRef, (logEntries) => {

  //   const geometryLogs = _.filter(logEntries, e => e.logType === 'Geometry');

  //   const shapes = geometryLogs.flatMap(log => {
  //     return log.body.flatMap(sh => {
  //       const svgShape = fromFigure(sh).svgShape() as any;
  //       svgShape.id = getId(svgShape);
  //       return svgShape;
  //     });
  //   })
  //   const dataSelection = d3.select(svg)
  //     .selectAll('.shape')
  //     .data(shapes, (sh: any) => sh.id);

  //   dataSelection.exit().remove();

  //   dataSelection.enter()
  //     .each(function (shape: any) {
  //       const self = d3.select(this);
  //       return self.append(shape.type)
  //         .call(initShapeAttrs) ;
  //     });
  // });

  // return {
  //   eventlibCore,
  //   superimposedElements,
  //   setGlyphOverlays
  // }
}

function getCls(data: any) {
  let cls = 'shape';
  if (data.class !== undefined) {
    cls = `${cls} ${data.class}`;
  }
  if (data.hover) {
    cls = `${cls} hover`;
  }

  return cls;
}

function initShapeAttrs(r: any) {
  const shape = r.node().nodeName.toLowerCase();

  switch (shape) {
    case 'rect':
      return r.attr('x', (d: any) => d.x)
          .attr('y', (d: any) => d.y)
          .attr('width', (d: any) => d.width)
          .attr('height', (d: any) => d.height)
          .attr('class', getCls)
          // .attr("label", getCls)
          .attr('id', (d: any) => d.id)
          .attr('opacity', 0.3)
          .attr('fill-opacity', 0.4)
          .attr('stroke-opacity', 0.9)
          .attr('stroke-width', 2)
          .attr('fill',  'black')
          // .attr("fill",  setDefaultFillColor)
          .attr('stroke', 'green')
          // .call(addTooltip)
      ;

    case 'circle':
      return r.attr('cx', (d: any) => d.cx)
          .attr('cy', (d: any) => d.cy)
          .attr('r', (d: any) => d.r)
          .attr('class', getCls)
          // .attr("label", getCls)
          .attr('id', (d: any) => d.id)
          .attr('fill-opacity', 0.2)
          .attr('stroke-width', 1)
          .attr('fill',  'black')
          .attr('stroke', 'green')
          // .call(addTooltip)
      ;

    case 'line':
      return r.attr('x1', (d: any) => d.x1)
          .attr('y1', (d: any) => d.y1)
          .attr('x2', (d: any) => d.x2)
          .attr('y2', (d: any) => d.y2)
          .attr('class', getCls)
          // .attr("label", getCls)
          .attr('id', (d: any) => d.id)
          .attr('stroke-width', 2)
          .attr('fill',  'black')
          .attr('stroke', 'green')
      ;
    case 'path':
      return r.attr('d', (d: any) => d.d)
          .attr('class', getCls)
          // .attr("label", getCls)
          .attr('id', (d: any) => d.id)
          .attr('stroke-width', 1)
          .attr('fill',  'blue')
          .attr('stroke', 'black')
          .attr('fill-opacity', 0.2)
          .attr('stroke-opacity', 0.3)
      ;
  }

  return r;
}

// TODO fix the output of TextWorks so that all shapes have an id, then get rid of this function:
function getId(data: any): string {
  const shape = data.type;

  let id = '';

  if (data.id !== undefined) {
    id = data.id;
  } else {

    switch (shape) {
      case 'rect':
        id =  `r_${data.x}_${data.y}_${data.width}_${data.height}`;
        break;
      case 'circle':
        id =  `c_${data.cx}_${data.cy}_${data.r}`;
        break;
      case 'line':
        id =  `l_${data.x1}_${data.y1}_${data.x2}_${data.y2}`;
        break;
      case 'path':
        id =  `p_${data.d}`;
        break;
      default:
        throw new Error(`getId(shape=${data}) could not construct id`);
    }
  }

  return id;
}
