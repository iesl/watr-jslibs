import _ from 'lodash';

import * as PIXI from 'pixi.js';

import { ref, watch, Ref, createComponent, inject, onMounted, provide  } from '@vue/composition-api';

import { initState } from '~/components/compositions/component-basics'
import { useEventlibCore } from '~/components/compositions/eventlib-core';
import { useImgCanvasOverlays } from '~/components/compositions/elem-overlays';
import { useCanvasDrawto } from '~/components/compositions/drawto-canvas';
import { useGlyphOverlays } from '~/components/compositions/glyph-overlay-component';
import { useGlyphSelection } from '~/components/compositions/glyph-selection-component';
import { useEventlibSelect } from '~/components/compositions/eventlib-select';

import {
  // coords,
  // MouseHandlerSets as mhs,
  // MouseHandlers,
  // GridTypes,
  // Point,
  BBox,
} from "sharedLib";
import { GridData } from '~/lib/TextGlyphDataTypes';
// import { prettyPrint } from '~/lib/pretty-print';


const ProvidedTextgrid = 'ProvidedTextgrid';

export interface TextgridAndBounds {
  textgrid: GridData;
  pageBounds: BBox;
}

// export type TextgridRef = Ref<GridTypes.Textgrid|null>;
export type TextgridRef = Ref<TextgridAndBounds|null>;

export function provideTextGrid(t: TextgridRef): void {
  provide(ProvidedTextgrid, t)
}

export function injectTextGrid(): TextgridRef {
  return inject(ProvidedTextgrid, ref(null));
}

export default createComponent({
  setup() {
    const providedTextgridRef = injectTextGrid();

    const mountPoint: Ref<HTMLDivElement|null> = ref(null);
    const state = initState();

    const eventlibCore = useEventlibCore({ targetDivRef: mountPoint, state } );
    const imgCanvasOverlay = useImgCanvasOverlays({ mountPoint, state });
    const canvasRef = imgCanvasOverlay.elems.canvasElem;
    const canvasDrawto = useCanvasDrawto({ canvasRef, containerRef: mountPoint, state });
    const eventlibSelect = useEventlibSelect({ eventlibCore, canvasDrawto, state });
    const glyphOverlays = useGlyphOverlays({ state, eventlibCore, canvasDrawto, imgCanvasOverlay });
    const { rtreeSearch, setGrid } = glyphOverlays;
    useGlyphSelection({ canvasDrawto, rtreeSearch, eventlibSelect, state });


    onMounted(() => {
      watch(providedTextgridRef, (textgrid) => {
        if (textgrid===null) return;
        const pixiJsApp = canvasDrawto.pixiJsAppRef.value!;

        // TODO the pageBounds here are for the original page of the Pdf, should be the computed text geometry
        setGrid(textgrid.textgrid.textDataPoints, textgrid.pageBounds);

        // useTextDrawing()...
        const style = new PIXI.TextStyle({
          fontFamily: 'Times New Roman',
          fontSize: 20,
          fontStyle: 'normal',
          fontWeight: 'normal',
          // fill: ['#ffffff', '#00ff99'], // gradient
          // stroke: '#4a1850',
          // strokeThickness: 5,
          // dropShadow: true,
          // dropShadowColor: '#000000',
          // dropShadowBlur: 4,
          // dropShadowAngle: Math.PI / 6,
          // dropShadowDistance: 6,
          // wordWrap: true,
          // wordWrapWidth: 440,
        });

        const richText = new PIXI.Text('Rich text with a lot of options and across multiple lines', style);
        richText.x = 50;
        richText.y = 250;
        const textDataPoints = textgrid.textgrid.textDataPoints;
        console.log('starting text init');

        const allText = _.map(textDataPoints, textDataPoint => {
          const c = textDataPoint.char;
          const x = textDataPoint.minX;
          const y = textDataPoint.maxY;
          const t = new PIXI.Text(c, style);
          t.x = x;
          t.y = y;
          return t;
        });

        console.log('ending text init');
        console.log('starting add child');

        pixiJsApp.stage.addChild(...allText);
        console.log('ending add child');

      });

    });

    return {
      mountPoint
    };
  }
});
