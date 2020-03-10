import {
  ref,
  Ref,
  onMounted,
} from '@vue/composition-api';


import textgrid00 from '~/../dev-data/textgrids/textgrid-00.json';

import { initState, waitFor } from '~/components/basics/component-basics'
import { usePdfPageViewer } from '~/components/subsystems/pdf-page-viewer';
import * as coords from '~/lib/coord-sys';
import * as GridTypes from '~/lib/TextGridTypes';
import { initGridData, gridDataToGlyphData } from '~/lib/TextGlyphDataTypes';
import { Point } from '~/lib/coord-sys';
import { resolveCorpusUrl } from '~/lib/axios';

export default {
  setup() {
    // TODO: setHoveredText
    // TODO: setClickedText

    const state = initState();

    const mountPoint: Ref<HTMLDivElement|null> = ref(null);

    const pdfPageViewer = usePdfPageViewer({ mountPoint, state });

    const { superimposedElements  } = pdfPageViewer;


    onMounted(() => {
      const imageUrl = resolveCorpusUrl('1503.00580.pdf.d', 'image', '1');
      superimposedElements.setImageSource(imageUrl);
      const grid: GridTypes.Grid = textgrid00 as any as GridTypes.Grid;
      const page0 = grid.pages[0]
      // // TODO: why is this margin here? hardcoded?
      const [l, t, w, h] = page0.pageGeometry;
      const pageBounds = coords.mk.fromArray([l, t, w, h]);
      const tmpPageMargin = 10;
      const origin = new Point(tmpPageMargin, tmpPageMargin, coords.CoordSys.GraphUnits);
      const gridData = initGridData(page0.textgrid, 0, () => 10, origin, 10);
      const glyphData = gridDataToGlyphData(gridData.textDataPoints);

      waitFor('PdfPageStory', { state }, () => {
        pdfPageViewer.setGrid(glyphData, pageBounds);
      });

    });

    return {
      mountPoint
    };
  }
}
