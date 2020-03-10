

// import PdfTextViewer from '../index.vue';
import { usePdfTextViewer } from '../../pdf-text-viewer';
import { defineComponent, ref, onMounted } from '@vue/composition-api';
import * as GridTypes from '~/lib/TextGridTypes';
import * as coords from '~/lib/coord-sys';
import { configAxios } from '~/lib/axios';
import { initState } from '~/components/basics/component-basics';
import { divRef } from '~/lib/vue-composition-lib';

export default defineComponent({
  components: {},
  setup() {

    const state = initState();
    const mountPoint = divRef();

    const pdfTextViewer = usePdfTextViewer({ mountPoint, state });
    const { setText } = pdfTextViewer;

    onMounted(() => {

      configAxios().get('/textgrids/textgrid-00.json')
        .then(resp => {
          const grid: GridTypes.Grid = resp.data;
          const page0 = grid.pages[0]
          const textgrid = page0.textgrid;
          const [l, t, w, h] = page0.pageGeometry;
          const pageBounds = coords.mk.fromArray([l, t, w, h]);
          setText({ textgrid, pageBounds });

        });

    })


    return {
      mountPoint
    };
  }
});