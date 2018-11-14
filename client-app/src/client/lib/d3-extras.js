/**
 *
 */

import * as d3 from 'd3';

export function initRect(sel, fbbox) {
    sel .attr("x"      , d => fbbox(d).left)
        .attr("y"      , d => fbbox(d).top)
        .attr("width"  , d => fbbox(d).width)
        .attr("height" , d => fbbox(d).height);
}

export function initStroke(sel, stroke, strokeWidth, strokeOpacity) {
    sel .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity);
}
export function initFill(sel, fill, fillOpacity) {
    sel .attr("fill", fill)
        .attr("fill-opacity", fillOpacity);
}

export let d3select = {
    pageTextgridSvg: (n) => {
        return d3.select('div.page-textgrids').select(`svg#textgrid-svg-${n}`);
    },
};


export function getId(data) {
    let shape = data.type;

    if (data.id !== undefined) {
        return data.id;
    } else {
        switch (shape) {
        case "rect":
            return "r_" + data.x + "_" + data.y + "_" + data.width + "_" + data.height;
        case "circle":
            return "c_" + data.cx + "_" + data.cy + "_" + data.r ;
        case "line":
            return "l_" + data.x1 + "_" + data.y1 + "_" + data.x2 + "_" + data.y2 ;
        }
    }
    return "";
}

export function d3$id(selector) {
    return d3.select('#'+selector);
}

/**
 *
 * Allow sequencing of d3 animations by waiting for all transitions to end before moving to the next "step"
 *
 */

function onEndAll (transition, callback) {
  if (transition.empty()) {
    callback();
  } else {
    let n = transition.size();
    transition.on("end", function () {
      n--;
      if (n === 0) {
        callback();
      }
    });
  }
}

export function stepThrough(interpFunc, steps) {
  if (steps.length > 0) {
    let step = steps[0];

    interpFunc(step)
      .transition()
      .delay(300)
      .call(onEndAll, function(){
        stepThrough(interpFunc, steps.slice(1));
      });
  }
}
