//

import _ from "lodash";

import {
  getOrDie
} from "sharedLib";


export function resizeCanvas(htmlCanvas: HTMLCanvasElement, width: number, height: number): void {
  const context = getOrDie(htmlCanvas.getContext('2d'));

  const {
    direction,
    font,
    textAlign,
    textBaseline,
  } = context;


  htmlCanvas.width = width;
  htmlCanvas.height = height;
  htmlCanvas.style.width = width.toString();
  htmlCanvas.style.height = height.toString();

  context.direction    = direction;
  context.font         = font;
  context.textAlign    = textAlign;
  context.textBaseline = textBaseline;

}

