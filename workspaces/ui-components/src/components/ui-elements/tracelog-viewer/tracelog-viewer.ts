import _ from 'lodash';

import {
  Ref,
  createComponent,
  provide,
  ref,
  SetupContext
} from '@vue/composition-api';


import { useTracelogPdfPageViewer } from '~/components/subsystems/pdf-page-viewer';
import { divRef } from '~/lib/vue-composition-lib';
import { initState } from '~/components/basics/component-basics';
import NarrowingFilter from '~/components/ui-elements/narrowing-filter/index.vue';
import { ProvidedChoices } from '~/components/ui-elements/narrowing-filter/narrowing-filter';
import { configAxios } from '~/lib/axios';
import { groupTracelogsByKey } from '~/lib/tracelogs';

export interface TracelogViewer {
  pageViewerMount: Ref<HTMLDivElement|null>;
}


export default createComponent({
  components: { NarrowingFilter },
  setup(_props, context: SetupContext) {

    // const { params, query } = context.root.$route;
    // console.log('params', params);
    // console.log('query', query);
    const choicesRef: Ref<Array<string> | null> = ref(null)

    const dbgTracelogUrl = '/tracelogs/tracelog.json';
    // const entryId = query.id;
    configAxios().get(dbgTracelogUrl)
      .then(resp => {
        const tracelogJson = resp.data;

        const logEntryGroups = groupTracelogsByKey(tracelogJson);
        const choices = _.map(logEntryGroups, ({groupKey}) => groupKey);
        choicesRef.value = choices;
      });

    provide(ProvidedChoices, choicesRef);

    const state = initState();
    const pageViewerMount = divRef();

    const mountPoint = divRef();
    const pdfPageViewer = useTracelogPdfPageViewer({ mountPoint: pageViewerMount, state });
    const { setGrid } = pdfPageViewer;

    return {
      mountPoint,
      pageViewerMount
    }
  }
})
