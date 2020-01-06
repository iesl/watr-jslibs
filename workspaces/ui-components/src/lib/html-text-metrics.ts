/**
 * A collection of utilities to determine the exact sizes and positions of
 * html text.
 **/

export interface TextStyle {
  style: string,
  variant?: string,
  weight: string,
  size: number,
  family: string
};

export function makeStyleString(style: TextStyle): string {
  return `${style.weight} ${style.size}px ${style.family}`;
}

export interface LineDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
  elementDimensions: TextDimensions[];
}

export interface TextDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
};


export function getTextWidth(ctx: CanvasRenderingContext2D, text: string, font: string): number {
  ctx.font = font;
  const metrics: TextMetrics = ctx.measureText(text);
  return metrics.width;
}

import $ from 'jquery';
import _ from 'lodash';

// export function getTextDimensionsJQuery(text: string) {
// }

export function showText(text: string, div: HTMLDivElement, atX: number, atY: number): LineDimensions {

  const w = $(div).outerWidth();
  const lineWidth = w!==undefined? w : 0;
  const h = $(div).outerHeight();
  const lineHeight = h!==undefined? h : 0;

  let currX = atX;
  const sizes = _.map(_.range(1, text.length+1), (i: number) => {
    const inits = text.slice(0, i);
    // div.innerText= inits;
    $(div).text(inits)
    const cw = $(div).outerWidth();
    const currWidth = cw!==undefined? cw : 0;
    const ch = $(div).outerHeight();
    const currHeight = ch!==undefined? ch : 0;
    // const textWidth = getTextWidth(inits, fontstring);
    const charWidth = currWidth - currX + atX;
    // const floorWidth = Math.floor(charWidth);
    // const floorX = Math.floor(currX);
    const size = { x: currX, y: atY, width: charWidth, height: currHeight};
    const dbg = `${i}> '${inits}' = currW:${cw} charW:${charWidth}`;
    console.log(dbg);
    currX = currWidth + atX;

    return size;
  });

  const lineDimensions: LineDimensions = {
    x: 0, y: 0,
    width: lineWidth,
    height: lineHeight,
    elementDimensions: sizes
  };

  return lineDimensions;

}

/*
  // <span class="my_class">Hello World</span>
  // .my_class {
  //   font:30em Arial;
  //   white-space: nowrap;
  // }
  // .textDimensionCalculation {
  //   position: absolute;
  //   visibility: hidden;
  //   height: auto;
  //   width: auto;
  //   white-space: nowrap;
  // }
*/
