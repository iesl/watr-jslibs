import {
  ref,
  Ref,
  onMounted,
} from '@vue/composition-api';


// import onelineTextgrid from '~/../dev-data/textgrids/textgrid-oneline.json';
import textgrid00 from '~/../dev-data/textgrids/textgrid-00.json';

import { initState, waitFor } from '~/components/compositions/component-basics'
import { usePdfPageViewer } from '~/components/compositions/pdf-page';
import { GridTypes, Point, coords } from 'sharedLib';
import { initGridData, gridDataToGlyphData } from '~/lib/TextGlyphDataTypes';

export default {
  setup() {
    // TODO: setHoveredText
    // TODO: setClickedText

    const state = initState();

    const mountPoint: Ref<HTMLDivElement|null> = ref(null);

    const pdfPageViewer = usePdfPageViewer({ mountPoint, state });

    const { imgCanvasOverlay  } = pdfPageViewer;


    onMounted(() => {
      imgCanvasOverlay.setImageSource(`http://localhost:3100/corpus-entry-0/page-images/page-1.opt.png`);
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
        // TODO figure out how to set the correct dimensions for the img/canvas elems
        imgCanvasOverlay.setDimensions(910, 1213);
        pdfPageViewer.setGrid(glyphData, pageBounds);
      });

    });



    return {
      mountPoint
    };
  }
}
