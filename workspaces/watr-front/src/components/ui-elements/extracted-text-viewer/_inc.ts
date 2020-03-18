import _ from 'lodash';

import {
  defineComponent,
  SetupContext,
  ref,
  Ref,
} from '@vue/composition-api';

import { divRef } from '~/lib/vue-composition-lib';
import { initState, awaitRef } from '~/components/basics/component-basics';
import { getArtifactData } from '~/lib/axios';
import { getQueryString } from '../tracelog-viewer/tracelog-viewer';
import * as GridTypes from '~/lib/TextGridTypes';
import * as coords from '~/lib/coord-sys';
import { LogEntry } from '~/lib/tracelogs';
import { useTracelogPdfPageViewer } from '~/components/subsystems/pdf-page-viewer';
import { usePdfTextViewer } from '~/components/subsystems/pdf-text-viewer'

export default defineComponent({

  setup(_props, context: SetupContext) {

    const pageViewers = divRef();
    const pageTexts = divRef();
    const state = initState();

    const { query } = context.root.$route;
    const entryId = getQueryString(query, 'id');

    if (entryId) {

      awaitRef(pageTexts).then(pageTextsDiv => {

        getArtifactData(entryId, 'textgrid')
          .then((textgrid: GridTypes.Grid) => {
            _.each(textgrid.pages, async (page, pageNumber) => {

              const tmount = document.createElement('div');
              pageTextsDiv.appendChild(tmount);
              const tmountRef = divRef();
              tmountRef.value = tmount;
              const pdfTextViewer = await usePdfTextViewer({ mountPoint: tmountRef, state });
              const { setText } = pdfTextViewer;
              const pageBounds = coords.mk.fromLtwh(20, 20, 0, 0);
              const textgrid = page.textgrid;
              setText({ textgrid, pageBounds });



              const mount = document.createElement('div');
              const pageViewersDiv = await awaitRef(pageViewers);
              pageViewersDiv.appendChild(mount);
              const mountRef = divRef();
              mountRef.value = mount;

              const logEntryRef: Ref<LogEntry[]> = ref([]);

              await useTracelogPdfPageViewer({
                mountPoint: mountRef,
                pageNumber,
                entryId,
                logEntryRef,
                pageBounds: page.pageGeometry,
                state
              });

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
