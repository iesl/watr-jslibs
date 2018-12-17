/**
 *
 */

import * as d3 from 'd3';
import { BBox } from './coord-sys';

// Sel Elem type, Sel Data Type, Parent Elem type, parent data type
// type D3Selection = d3.Selection<d3.BaseType, any, HTMLElement, any>;
// type D3Selection = d3.Selection;
// export interface Selection<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> {

export function initRect <GElement extends d3.BaseType, Datum, PElement extends d3.BaseType, PDatum> (
  sel: d3.Selection<GElement, Datum, PElement, PDatum>,
  fbbox: (d: any) => BBox
) {
    sel .attr("x"      , d => fbbox(d).left)
        .attr("y"      , d => fbbox(d).top)
        .attr("width"  , d => fbbox(d).width)
        .attr("height" , d => fbbox(d).height);
}

export function initStroke <GElement extends d3.BaseType, Datum, PElement extends d3.BaseType, PDatum> (
  sel: d3.Selection<GElement, Datum, PElement, PDatum>,
  stroke: string, strokeWidth: number, strokeOpacity: number) {
    sel .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity);
}
export function initFill <GElement extends d3.BaseType, Datum, PElement extends d3.BaseType, PDatum> (
    sel: d3.Selection<GElement, Datum, PElement, PDatum>,
  fill: string, fillOpacity: number
) {
    sel .attr("fill", fill)
        .attr("fill-opacity", fillOpacity);
}

export let d3select = {
  pageTextgridSvg: (n: number) => {
        return d3.select('div.page-textgrids').select(`svg#textgrid-svg-${n}`);
    },
};


export function getId(data: any) {
  const shape = data.type;

  if (data.id !== undefined) {
    return data.id;
  }
  switch (shape) {
    case "rect":
      return `r_${data.x}_${data.y}_${data.width}_${data.height}`;
    case "circle":
      return `c_${data.cx}_${data.cy}_${data.r}`;
    case "line":
      return `l_${data.x1}_${data.y1}_${data.x2}_${data.y2}`;
    default:
      return "";
  }
}

// export function select<GElement extends BaseType, OldDatum>(selector: string): Selection<GElement, OldDatum, HTMLElement, any>;
export function d3id<GElement extends d3.BaseType>(
  selector: string
): d3.Selection<GElement, any, HTMLElement, any> {
  return d3.select<GElement, any>(`#${selector}`);
}

/**
 *
 * Allow sequencing of d3 animations by waiting for all transitions to end before moving to the next "step"
 *
 */

function onEndAll (transition: any, callback: any) {
  if (transition.empty()) {
    callback();
  } else {
    let n = transition.size();
    transition.on("end",  () => {
      n = n-1;
      if (n === 0) {
        callback();
      }
    });
  }
}

export function stepThrough(interpFunc: any, steps: any) {
  if (steps.length > 0) {
    const step = steps[0];

    interpFunc(step)
      .transition()
      .delay(300)
      .call(onEndAll, () => {
        stepThrough(interpFunc, steps.slice(1));
      });
  }
}
