import {
  ref,
  Ref,
} from '@vue/composition-api';

import { initState } from '~/components/basics/component-basics'
import { usePdfPageViewer } from '~/components/subsystems/pdf-page-viewer';
import * as coords from '~/lib/coord-sys';
import * as GridTypes from '~/lib/TextGridTypes';
import { initGridData, gridDataToGlyphData } from '~/lib/TextGlyphDataTypes';
import { Point } from '~/lib/coord-sys';
import { resolveCorpusUrl, getArtifactData } from '~/lib/axios';
import { LogEntry } from '~/lib/tracelogs';

export default {
  setup() {
    // TODO: setHoveredText
    // TODO: setClickedText

    const state = initState();

    const mountPoint: Ref<HTMLDivElement|null> = ref(null);
    const logEntryRef: Ref<LogEntry[]> = ref([]);


    const entryId = '1503.00580.pdf.d';

    getArtifactData(entryId, 'textgrid')
      .then(async (grid: GridTypes.Grid) => {
        const page0 = grid.pages[0]
        // TODO: why is this margin here? hardcoded?
        const [l, t, w, h] = page0.pageGeometry;
        const pageBounds = coords.mk.fromArray([l, t, w, h]);
        const tmpPageMargin = 10;
        const origin = new Point(tmpPageMargin, tmpPageMargin, coords.CoordSys.GraphUnits);
        const gridData = initGridData(page0.textgrid, 0, () => 10, origin, 10);
        const glyphData = gridDataToGlyphData(gridData.textDataPoints);

        const pdfPageViewer = await usePdfPageViewer({
          mountPoint,
          state,
          pageNumber: 1,
          entryId: '',
          logEntryRef,
          pageBounds: [l, t, w, h]
        });

        const { superimposedElements  } = pdfPageViewer;
        const imageUrl = resolveCorpusUrl(entryId, 'image', '1');
        superimposedElements.setImageSource(imageUrl);
        pdfPageViewer.setGrid(glyphData, pageBounds);
      });

    return {
      mountPoint
    };
  }
}
