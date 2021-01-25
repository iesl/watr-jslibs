/**
 *
 */

import {
  Selection,
  BaseType,
  select
} from 'd3-selection';

import 'd3-transition';

import { BBox } from '~/lib/coord-sys';
import { SelectionOrTransition } from 'd3-transition';

export function initRect<GElement extends BaseType, Datum, PElement extends BaseType, PDatum > (
  sel: Selection<GElement, Datum, PElement, PDatum>,
  fbbox: (d: any) => BBox
) {
  sel.attr('x'      , d => fbbox(d).x)
    .attr('y'      , d => fbbox(d).y)
    .attr('width'  , d => fbbox(d).width)
    .attr('height' , d => fbbox(d).height);
}

export function initStroke <GElement extends BaseType, Datum, PElement extends BaseType, PDatum> (
  sel: Selection<GElement, Datum, PElement, PDatum>,
  stroke: string, strokeWidth: number, strokeOpacity: number
) {
  sel.attr('stroke', stroke)
    .attr('stroke-width', strokeWidth)
    .attr('stroke-opacity', strokeOpacity);
}

export function initFill<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> (
  sel: SelectionOrTransition<GElement, Datum, PElement, PDatum>,
  fill: string, fillOpacity: number
) {
  sel.attr('fill', fill);
  sel.attr('fill-opacity', fillOpacity);
}



export function initFillx<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> (
  sel: Selection<GElement, Datum, PElement, PDatum>,
  fill: string, fillOpacity: number
) {
  sel.attr('fill', fill)
    .attr('fill-opacity', fillOpacity);
}

export function getId(data: any) {
  const shape = data.type;

  if (data.id !== undefined) {
    return data.id;
  }
  switch (shape) {
    case 'rect':
      return `r_${data.x}_${data.y}_${data.width}_${data.height}`;
    case 'circle':
      return `c_${data.cx}_${data.cy}_${data.r}`;
    case 'line':
      return `l_${data.x1}_${data.y1}_${data.x2}_${data.y2}`;
    default:
      return '';
  }
}

export function d3id<GElement extends BaseType>(
  selector: string
): Selection<GElement, any, HTMLElement, any> {
  return select<GElement, any>(`#${selector}`);
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
    transition.on('end',  () => {
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
