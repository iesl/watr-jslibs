import { usePdfTextViewer } from '~/components/subsystems/pdf-text-viewer'
import { defineComponent } from '@vue/composition-api';
import * as GridTypes from '~/lib/TextGridTypes';
import * as coords from '~/lib/coord-sys';
import { getArtifactData } from '~/lib/axios';
import { initState } from '~/components/basics/component-basics';
import { divRef } from '~/lib/vue-composition-lib';

export default defineComponent({
  components: {},
  setup() {

    const state = initState();
    const mountPoint = divRef();

    usePdfTextViewer({ mountPoint, state }).then(pdfTextViewer => {

    const { setText } = pdfTextViewer;

    const entryId = '1503.00580.pdf.d';

    getArtifactData(entryId, 'textgrid')
      .then((grid: GridTypes.Grid) => {
        const page0 = grid.pages[0]
        const textgrid = page0.textgrid;
        const pageBounds = coords.mk.fromLtwh(20, 20, 0, 0);
        setText({ textgrid, pageBounds });
      });
    });

    return {
      mountPoint
    };
  }
});
