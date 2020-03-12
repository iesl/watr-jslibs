import { usePdfTextViewer } from '~/components/subsystems/pdf-text-viewer'
import { defineComponent, SetupContext } from '@vue/composition-api';
import * as GridTypes from '~/lib/TextGridTypes';
import * as coords from '~/lib/coord-sys';
import { getArtifactData } from '~/lib/axios';
import { initState, watchOnceFor } from '~/components/basics/component-basics';
import { divRef } from '~/lib/vue-composition-lib';
import { getQueryString } from '~/components/ui-elements/tracelog-viewer/tracelog-viewer';

const delay = (t: number) => new Promise(resolve => setTimeout(resolve, t));

export default defineComponent({
  components: {},
  setup(_props, context: SetupContext) {

    const state = initState();
    const pageTexts = divRef();


    const { query } = context.root.$route;
    const entryId = getQueryString(query, 'id');


    if (entryId) {
      getArtifactData(entryId, 'textgrid')
        .then((grid: GridTypes.Grid) => {
          delay(400).then(() => {
            console.log('usePdfTextViewer: pre')
            const pdfTextViewer = usePdfTextViewer({ mountPoint: pageTexts, state });
            console.log('usePdfTextViewer: post')

            const pageTextsDiv = pageTexts.value!;
            const tmount = document.createElement('div');
            pageTextsDiv.append(tmount);
            const tmountRef = divRef();
            tmountRef.value = tmount;

            const page0 = grid.pages[0]
            const textgrid = page0.textgrid;
            const pageBounds = coords.mk.fromLtwh(20, 20, 0, 0);
            pdfTextViewer.setText({ textgrid, pageBounds });
          });
        });
    }

    return {
      pageTexts
    };
  }
});
