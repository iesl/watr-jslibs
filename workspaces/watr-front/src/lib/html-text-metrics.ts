/**
 * A collection of utilities to determine the exact sizes and positions of
 * html text.
 **/

export interface TextStyle {
  style: string;
  variant?: string;
  weight: string;
  size: number;
  family: string;
}

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
}


export function getTextWidth(ctx: CanvasRenderingContext2D, text: string, font: string): number {
  ctx.font = font;
  const metrics: TextMetrics = ctx.measureText(text);
  return metrics.width;
}

import _ from 'lodash';
import { prettyPrint } from './pretty-print';

// TODO make sure that div.offsetWidth/Height are equivalent crossbrowser to $(div).outerWidth
export function showText(text: string, div: HTMLDivElement, atX: number, atY: number): LineDimensions {
  const lineWidth = div.offsetWidth;
  const lineHeight = div.offsetHeight;

  let currX = atX;
  let init = '';
  const sizes = [];
  for (let i=0; i<text.length; i++) {
    init += text.charAt(i);
    div.innerText = init;

    const currWidth = div.offsetWidth;
    const charWidth = currWidth - currX + atX;
    const size = { x: currX, y: atY, width: charWidth, height: lineHeight};
    // console.log('showText:inner', div.innerText)
    // console.log('showText:offsetWidth', div.clientWidth)
    sizes.push(size);
    currX = currWidth + atX;
  }

  const lineDimensions: LineDimensions = {
    x: 0, y: 0,
    width: lineWidth,
    height: lineHeight,
    elementDimensions: sizes
  };

  return lineDimensions;
}
