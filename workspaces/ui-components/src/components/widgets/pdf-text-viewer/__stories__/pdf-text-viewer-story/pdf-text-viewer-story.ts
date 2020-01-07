

import PdfTextViewer from '../../index.vue';
import { provideTextGrid, TextgridRef } from '../../pdf-text-viewer';
import { createComponent, ref, onMounted } from '@vue/composition-api';
import { GridTypes, coords } from 'sharedLib';
import { configAxios } from '~/lib/axios';
import Layout from '~/components/story-templates/titled-frame-template/index.vue';

export default createComponent({
  components: { PdfTextViewer, Layout },
  setup() {


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
