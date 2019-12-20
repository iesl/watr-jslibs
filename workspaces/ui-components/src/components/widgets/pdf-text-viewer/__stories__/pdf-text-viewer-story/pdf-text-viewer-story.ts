

import PdfTextViewer from '../../index.vue';
import { provideTextGrid, TextgridRef } from '../../pdf-text-viewer';
import { createComponent, ref, onMounted } from '@vue/composition-api';
import { GridTypes, coords, Point } from 'sharedLib';
import { configAxios } from '~/lib/axios';
import { initGridData, GridData } from '~/lib/TextGlyphDataTypes';

export default createComponent({
  components: { PdfTextViewer },
  setup() {


    // const providedTextgridRef: Ref<GridTypes.Textgrid|null> = ref(null);
    const providedTextgridRef: TextgridRef = ref(null);
    provideTextGrid(providedTextgridRef);

    onMounted(() => {

      configAxios().get('/textgrids/textgrid-00.json')
        .then(resp => {
          const grid: GridTypes.Grid = resp.data;
          const page0 = grid.pages[0]
          const textgrid = page0.textgrid;
          const [l, t, w, h] = page0.pageGeometry;
          const pageBounds = coords.mk.fromArray([l, t, w, h]);

          // const textWidth = () => 10; // (s: string) => context2d.measureText(s).width;
          // const textHeight = 12; // this.lineHeight;
          // const tmpPageMargin = 10;
          // const origin = new Point(tmpPageMargin, tmpPageMargin, coords.CoordSys.GraphUnits);
          // const gridData: GridData = initGridData(textgrid, 0, textWidth, origin, textHeight);
          providedTextgridRef.value = {
            textgrid,
            pageBounds
          };
        });

    })


    return {
    };
  }
});
