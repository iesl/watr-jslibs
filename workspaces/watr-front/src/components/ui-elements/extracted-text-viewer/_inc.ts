import _ from 'lodash';

import {
  Ref,
  defineComponent,
  ref,
  SetupContext,
} from '@vue/composition-api';

import { divRef } from '~/lib/vue-composition-lib';
import { initState, watchOnceFor } from '~/components/basics/component-basics';
import { getArtifactData } from '~/lib/axios';
import { getQueryString } from '../tracelog-viewer/tracelog-viewer';
import * as GridTypes from '~/lib/TextGridTypes';
import * as coords from '~/lib/coord-sys';
import { LogEntry } from '~/lib/tracelogs';
import { useTracelogPdfPageViewer } from '~/components/subsystems/pdf-page-viewer';
import { usePdfTextViewer } from '~/components/subsystems/pdf-text-viewer'

export default defineComponent({
  components: {  },

  setup(_props, context: SetupContext) {

    const pageViewers = divRef();
    const pageTexts = divRef();
    const state = initState();

    const { query } = context.root.$route;
    const entryId = getQueryString(query, 'id');

    if (entryId) {

      // watchOnceFor(pageViewers, (pageViewersDiv) => {
      watchOnceFor(pageTexts, (pageViewersDiv) => {
        getArtifactData(entryId, 'textgrid')
          .then((textgrid: GridTypes.Grid) => {
            const pageTextsDiv = pageTexts.value!;
            _.each([textgrid.pages[0]], (page, pageNumber) => {

              const tmount = document.createElement('div');
              pageTextsDiv.appendChild(tmount);
              const tmountRef = divRef();
              tmountRef.value = tmount;
              const pdfTextViewer = usePdfTextViewer({ mountPoint: tmountRef, state });
              const { setText } = pdfTextViewer;
              const pageBounds = coords.mk.fromLtwh(20, 20, 0, 0);
              const textgrid = page.textgrid;
              setText({ textgrid, pageBounds });


            //   const mount = document.createElement('div');
            //   pageViewersDiv.appendChild(mount);
            //   const mountRef = divRef();
            //   mountRef.value = mount;

            //   const logEntryRef: Ref<LogEntry[]> = ref([]);

            //   useTracelogPdfPageViewer({
            //     mountPoint: mountRef,
            //     pageNumber,
            //     entryId,
            //     logEntryRef,
            //     pageBounds: page.pageGeometry,
            //     state
            //   });
            });

          });
      });
    }
    return {
      pageViewers,
      pageTexts
    };
  }

})

/**

   <div class="extractedTextViewer">

   <div class="pageViewersFrame">
   <div ref="pageViewers" class="pageViewers" />
   </div>

   <div class="pageTextFrame">
   <div ref="pageTexts" class="pageTexts" />
   </div>

   </div>


   */
