/**
 * Provide a means to draw shape primitives to an underlying SVG.
 */
import _ from 'lodash';
import * as d3 from 'd3';

// import {
//   Ref,
// } from '@vue/composition-api';

import { StateArgs } from './component-basics';
import { SuperimposedElements } from './superimposed-elements';
import { Line, Point, Rect, Trapezoid, Shape, ShapeIntRepsToFloats, foldShape, mapShape, FoldF } from '~/lib/tracelogs';
import { Ref, ref, watch } from '@vue/composition-api';
import {
  Selection,
  BaseType,
} from "d3-selection";


export interface Sketchpad {
  // mousePosRef: UnwrapRef<SketchpadPoint>;
  // loadShapes: (shapes: RTreeIndexable[]) => void;
  // eventRTree: RBush<RTreeIndexable>;
  // setMouseHandlers: (hs: MouseHandlerInit[]) => void;
}

type Args = StateArgs & {
  superimposedElements: SuperimposedElements;
};



export function useSketchpad({
  state,
  superimposedElements,
}: Args): Sketchpad {

  const svgLayer = superimposedElements.overlayElements.svg!;
  const drawablesRef: Ref<Shape[]> = ref([]);

  const svgSelect = d3.select(svgLayer);
  const svgToD3 = shapeToD3Fold(svgSelect);
  watch(drawablesRef, (drawables)=> {
    const dr0 = _.map(drawables, d => mapShape(d, ShapeIntRepsToFloats))

    const d3s = _.map(dr0, d => foldShape(d, svgToD3))

  });

  return {
  };
}

export function shapeToD3Fold
  <GElement extends BaseType, Datum, PElement extends BaseType, PDatum> (
  sel: Selection<GElement, Datum, PElement, PDatum>
) {
  return <FoldF<void>>{
    line: (sh: Line) => {
      const x1 = `${sh.p1.x}`;
      const y1 = `${sh.p1.y}`;
      const x2 = `${sh.p2.x}`;
      const y2 = `${sh.p2.y}`;
      const asdf = sel.append('line')
        .datum(sh)
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
      ;
      return asdf;
    },
    point: (sh: Point) => {
      const cx = `${sh.x}`;
      const cy = `${sh.y}`;
      const r = `3`;
      return sel.append('circle')
        .datum(sh)
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r",  r)
      ;
    },
    rect: (sh: Rect) => {
      const [x0, y0, width0, height0] = sh.bounds;
      const x = `${x0}`;
      const y = `${y0}`;
      const width = `${width0}`;
      const height = `${height0}`;
      return sel.append('rect')
        .datum(sh)
        .attr("x", x)
        .attr("y", y)
        .attr("width",  width)
        .attr("height", height)
      ;

    },
    trapezoid: (sh: Trapezoid) => {
      const p1 = sh.topLeft;
      const p2x = p1.x + sh.topWidth;
      const p2y = p1.y;
      const p3x = sh.bottomLeft.x + sh.bottomWidth;
      const p3y = sh.bottomLeft.y;
      const p4 = sh.bottomLeft;
      const  d = `M ${p1.x} ${p1.y} L ${p2x} ${p2y} L ${p3x} ${p3y} L ${p4.x} ${p4.y} Z`;
      return sel.append('path')
        .datum(sh)
        .attr("d", d)
      ;
    }
  }
}
