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

export function showText(text: string, div: HTMLDivElement, atX: number, atY: number): LineDimensions {
  // const includeMargin = false;
  // let t0 = 0;
  // let t1 = 0;
  // let t2 = 0;
  // let t3 = 0;
  // let widths: [number, number][] = [];

  // var t0a = performance.now();

  // const w = $(div).outerWidth(includeMargin);
  // const lineWidth = w!==undefined? w : 0;
  const lineWidth = div.offsetWidth;
  const lineHeight = div.offsetHeight;
  // const h = $(div).outerHeight();
  // const lineHeight = h!==undefined? h : 0;

  let currX = atX;
  let init = '';
  const sizes = [];
  // var t1a = performance.now();
  for (let i=0; i<text.length; i++) {
    init += text.charAt(i);
    $(div).text(init)
    // var t2a = performance.now();
    // const cw = $(div).outerWidth(includeMargin);
    // var t2z = performance.now();
    // t2 += t2z - t2a;
    // const currWidth = cw!==undefined? cw : 0;

    // var t3a = performance.now();
    const currWidth = div.offsetWidth;
    // var t3z = performance.now();
    // t3 += t3z - t3a;

    // widths.push([ow, currWidth]);

    const charWidth = currWidth - currX + atX;
    const size = { x: currX, y: atY, width: charWidth, height: lineHeight};
    sizes.push(size);
    currX = currWidth + atX;
  }
  // var t1z = performance.now();
  // t1 += t1z - t1a;

  const lineDimensions: LineDimensions = {
    x: 0, y: 0,
    width: lineWidth,
    height: lineHeight,
    elementDimensions: sizes
  };

  // var t0z = performance.now();
  // t0 += t0z - t0a;
  // const t0Sum = t0.toFixed(2);
  // const t1Sum = t1.toFixed(2);
  // const t2Sum = t2.toFixed(2);
  // const t3Sum = t3.toFixed(2);

  // const allWidths = _.map(widths, ([w1, w2]) => {
  //   const abs = Math.abs(w1-w2);
  //   return `${abs.toFixed(2)}     = ${w1.toFixed(2)} ${w2.toFixed(2)}`
  // });
  // const fmtWidths = _.join(allWidths, "\n");

//   const result = `
// Function self-time : ${t0Sum}
// Loop time          : ${t1Sum}
// div.offsetWidth    : ${t3Sum}

// `;

//   console.log(result);

  return lineDimensions;

}
