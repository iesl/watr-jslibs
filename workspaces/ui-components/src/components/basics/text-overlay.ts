/**
 * Use plain html div to provide provide positioned text over a canvas or img elements
 * Use for tooltips, pdf text viewer, etc.
 */

import _ from 'lodash';


import { StateArgs } from '~/components/basics/component-basics'
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
  superimposedElements,
}: Args): TextOverlay {

  const textDiv = superimposedElements.overlayElements.textDiv!;

  function putTextLn(style: TextStyle, x: number, y: number, text: string): LineDimensions {
    const fontstring = makeStyleString(style);

    const div = document.createElement('div');
    div.classList.add('measured');
    div.style.display = 'inline-block';
    div.style.font = fontstring;
    div.style.left = `${x}px`;
    div.style.top = `${y}px`;
    const node = document.createTextNode(text);
    div.append(node)
    textDiv.appendChild(div);
    const lineDimensions = showText(text, div, x, y);
    div.style.visibility = 'visible';

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
