import _ from 'lodash';

import {
  Ref, ref, watch,
} from '@vue/composition-api';

import { StateArgs } from '~/components/compositions/component-basics'
import { prettyPrint } from '~/lib/pretty-print';
import { OverlayElements } from './elem-overlays';

type PrintText = (x: number, y: number, text: string) => void;

export interface TextOverlay {
  printText: PrintText;
}


type Args = StateArgs & {
  overlayElements: OverlayElements;
};


export function useTextOverlay({
  state,
  overlayElements,
}: Args): TextOverlay {

  const textBuffer: Ref<string|null> = ref(null);
  const textDivRef = overlayElements.textDivRef;

  if (textDivRef) {
    watch(textDivRef, (textDiv) => {
      if (!textDiv) return;
      // textDiv.innerText = textBuffer.value;
      watch(textBuffer, (buffer) => {
        if (buffer) {
          textDiv.innerText = buffer;
        }
      })

    })
  }


  const printText: PrintText = (x, y, text) => {
    console.log('printText', textDivRef);
    textBuffer.value = text;
    // if (textDivRef) {
    //   const textDiv = textDivRef.value!;
    //   console.log('textDiv', textDiv);
    //   // textDiv.innerHTML = `<span>${text}</span>`;
    // }
  };

  return {
    printText,
  };
}

// const dummyCanvas = document.createElement("canvas");
// const dummyContext = dummyCanvas.getContext("2d")!;
// function getTextWidth(text: string, font: string): number {
//   dummyContext.font = font;
//   const metrics: TextMetrics = dummyContext.measureText(text);
//   return metrics.width;
// }


/**
   TextMetrics members:
   const actualBoundingBoxAscent       = metrics.actualBoundingBoxAscent;
   const actualBoundingBoxDescent      = metrics.actualBoundingBoxDescent;
   const actualBoundingBoxLeft         = metrics.actualBoundingBoxLeft;
   const actualBoundingBoxRight        = metrics.actualBoundingBoxRight;
   const alphabeticBaseline            = metrics.alphabeticBaseline;
   const emHeightAscent                = metrics.emHeightAscent;
   const emHeightDescent               = metrics.emHeightDescent;
   const fontBoundingBoxAscent         = metrics.fontBoundingBoxAscent;
   const fontBoundingBoxDescent        = metrics.fontBoundingBoxDescent;
   const hangingBaseline               = metrics.hangingBaseline;
   const ideographicBaseline           = metrics.ideographicBaseline;
   const width                         = metrics.width;

*/
// console.log(getTextWidth("hello there!", "bold 12pt arial"));  // close to 86
