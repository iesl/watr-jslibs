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

// export function getTextDimensions(text: string) {
//   // Credit to http://jsfiddle.net/r491oe7z/2/

//   const div = document.createElement('div');
//   div.classList.add('textDimensionCalculation');
//   const node = document.createTextNode(text);
//   div.append(node);

//   document.body.appendChild(div);

//   const dimensions = {
//     width : jQuery(div).outerWidth(),
//     height : jQuery(div).outerHeight()
//   };

//   div.parentNode.removeChild(div);
// }

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
