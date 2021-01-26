/**
 * A collection of utilities to determine the exact sizes and positions of
 * html text.
 **/

import _ from 'lodash'
import { Rect } from './transcript/shapes'

export interface TextStyle {
  style: string;
  variant?: string;
  weight: string;
  size: number;
  family: string;
}

export function makeStyleString(style: TextStyle): string {
  return `${style.weight} ${style.size}px ${style.family}`
}


export interface LineDimensions extends Rect {
  charBounds: Rect[];
}

export function getTextWidth(ctx: CanvasRenderingContext2D, text: string, font: string): number {
  ctx.font = font
  const metrics: TextMetrics = ctx.measureText(text)
  return metrics.width
}

export function showText(text: string, div: HTMLDivElement, atX: number, atY: number): LineDimensions {
  const lineWidth = div.offsetWidth
  const lineHeight = div.offsetHeight

  let currX = atX;
  let init = '';
  const sizes: Rect[] = []
  // TODO re-enable char-wise size calculation when you can figure out how to do it efficiently
  for (let i=0; i<text.length; i++) {
    init += text.charAt(i);
    div.innerText = init;

    const currWidth = div.offsetWidth;
    const charWidth = currWidth - currX + atX;
    const size: Rect = { kind: 'rect', x: currX, y: atY, width: charWidth, height: lineHeight};
    sizes.push(size);
    currX = currWidth + atX;
  }

  const lineDimensions: LineDimensions = {
    kind: 'rect',
    x: 0,
    y: 0,
    width: lineWidth,
    height: lineHeight,
    charBounds: sizes
  }

  return lineDimensions
}
