/**
 * Use plain html div to provide provide positioned text over a canvas or img elements
 * Use for tooltips, pdf text viewer, etc.
 */

import _ from 'lodash';


import { StateArgs } from '~/components/compositions/component-basics'
import { SuperimposedElements  } from './superimposed-elements';
import { TextStyle, makeStyleString, LineDimensions } from '~/lib/html-text-metrics';


type PutText = (style: TextStyle, x: number, y: number, text: string) => LineDimensions;
type ClearText = () => void;

export interface TextOverlay {
  // putText: PutText;
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
  const textDiv = superimposedElements.overlayElements.textDiv;

  function getTextWidth(text: string, font: string): number {
    dummyContext.font = font;
    const metrics: TextMetrics = dummyContext.measureText(text);
    return metrics.width;
  }

  function putTextLn(style: TextStyle, x: number, y: number, text: string): LineDimensions {
    const textDivX = textDiv!;
    const fontstring = makeStyleString(style);

    const lineWidth = getTextWidth(text, fontstring);
    let currX = x;
    const sizes = _.map(text, char => {
      const textWidth = getTextWidth(char, fontstring);
      const floorWidth = Math.floor(textWidth);
      const floorX = Math.floor(currX);
      const size = { x: floorX, y, width: floorWidth, height: style.size};
      currX += textWidth;
      return size;
    });
    const lineDimensions: LineDimensions = {
      x, y,
      width: lineWidth,
      height: style.size,
      elementDimensions: sizes
    };
    const div = document.createElement('div');
    const node = document.createTextNode(text);
    div.classList.add('textoverlay');
    div.style.display = 'inline-block';
    div.style.position = 'absolute';
    div.style.font = fontstring;
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    // div.style.border = '1px solid black';
    div.style.verticalAlign = 'middle';
    div.append(node)
    textDivX.appendChild(div);

    return lineDimensions;
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
