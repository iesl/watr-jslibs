/**
 * Use plain html div to provide provide positioned text over a canvas or img elements
 * Use for tooltips, pdf text viewer, etc.
 */

import _ from 'lodash';


import { StateArgs } from '~/components/compositions/component-basics'
import { SuperimposedElements  } from './superimposed-elements';
import { TextStyle, makeStyleString, LineDimensions, showText } from '~/lib/html-text-metrics';


type PutText = (style: TextStyle, x: number, y: number, text: string) => LineDimensions;
type ClearText = () => void;

export interface TextOverlay {
  putTextLn: PutText;
  clearText: ClearText;
}


type Args = StateArgs & {
  superimposedElements: SuperimposedElements;
};


export function useTextOverlay({
  state,
  superimposedElements,
}: Args): TextOverlay {

  const dummyCanvas = document.createElement("canvas");
  const dummyContext = dummyCanvas.getContext("2d")!;
  const textDiv = superimposedElements.overlayElements.textDiv!;

  function getTextWidth(text: string, font: string): number {
    dummyContext.font = font;
    const metrics: TextMetrics = dummyContext.measureText(text);
    return metrics.width;
  }

  function getTextDimensions1(text: string, textStyle: TextStyle, initX: number, initY: number) {
    let currX = initX;
    const fontstring = makeStyleString(textStyle);
    const sizes = _.map(_.range(1, text.length+1), (i: number) => {
      const inits = text.slice(0, i);
      const textWidth = getTextWidth(inits, fontstring);
      const charWidth = textWidth - currX + initX;
      const floorWidth = Math.floor(charWidth);
      const floorX = Math.floor(currX);
      const size = { x: floorX, y: initY, width: floorWidth, height: textStyle.size};
      // const dbg = `${i}> '${inits}' = w:${textWidth} c:${charWidth}`;
      // console.log(dbg);
      currX = textWidth + initX;

      return size;
    });
    return sizes;
  }

  function putTextLn(style: TextStyle, x: number, y: number, text: string): LineDimensions {
    // const textDivX = textDiv!;
    const fontstring = makeStyleString(style);

    // const sizes = getTextDimensions1(text, style, x, y);
    // const lineWidth = getTextWidth(text, fontstring);

    // const lineDimensions: LineDimensions = {
    //   x, y,
    //   width: lineWidth,
    //   height: style.size,
    //   elementDimensions: sizes
    // };
    const div = document.createElement('div');
    div.classList.add('textoverlay');
    div.classList.add('measured');
    // div.style.display = 'inline-block';
    // div.style.position = 'absolute';
    div.style.font = fontstring;
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    // div.style.whiteSpace = 'nowrap';
    // div.style.border = '1px solid black';
    // div.style.verticalAlign = 'middle';
    const node = document.createTextNode(text);
    div.append(node)
    textDiv.appendChild(div);
    const lineDimensions2 = showText(text, div, x, y);

    // const lineDimensions2: LineDimensions = {
    //   x, y,
    //   width: lineWidth,
    //   height: style.size,
    //   elementDimensions: textDimensions
    // };

    return lineDimensions2;
  }

  const clearText: ClearText = () => {
    if (textDiv) {
      textDiv.childNodes.forEach(n => n.remove());
    }
  };

  return {
    putTextLn,
    clearText,
  };
}
