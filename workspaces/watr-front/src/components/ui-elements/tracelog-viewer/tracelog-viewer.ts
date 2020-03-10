import _ from 'lodash';

import {
  Ref,
  defineComponent,
  provide,
  ref,
  SetupContext,
} from '@vue/composition-api';


import { useTracelogPdfPageViewer } from '~/components/subsystems/pdf-page-viewer';
import { divRef } from '~/lib/vue-composition-lib';
import { initState, watchOnceFor } from '~/components/basics/component-basics';
import NarrowingFilter from '~/components/ui-elements/narrowing-filter/index.vue';
import { ProvidedChoices } from '~/components/ui-elements/narrowing-filter/narrowing-filter';
import { getArtifactData } from '~/lib/axios';
import { groupTracelogsByKey, LogEntryGroup, LogEntry } from '~/lib/tracelogs';
import * as GridTypes from '~/lib/TextGridTypes';

type Dictionary < T > = { [key: string]: T }
type QObject = Dictionary<string | (string|null)[]>;

export function getQueryString(queryObject: QObject, key: string): string | undefined {
  const qval = queryObject[key];
  if (typeof qval === 'string') {
    return qval;
  }
  return undefined;
}

export interface TracelogViewer {
  pageViewerMount: Ref<HTMLDivElement | null>;
}

export default defineComponent({
  components: { NarrowingFilter },

  setup(_props, context: SetupContext) {

    const pageViewers = divRef();
    const mountPoint = divRef();
    const state = initState();


    const { query } = context.root.$route;
    const choicesRef: Ref<Array<string> | null> = ref(null)
    const tracelogRefs: Array<Ref<LogEntry[]>> = [];
    let logEntryGroups: LogEntryGroup[] = [];

    const onItemsReset = () => {
      //
      _.each(tracelogRefs, r => {
        if (r.value.length > 0) {
          r.value = [];
        }
      });
    };

    const onItemsSelected = (selection: string[]) => {
      const selectedGroups = _.filter(logEntryGroups, g =>  _.includes(selection, g.groupKey));
      const selGroupsByPage = _(selectedGroups)
        .flatMap(g => g.logEntries)
        .groupBy(e => e.page)
        .value();

      _.each(_.toPairs(selGroupsByPage), ([pageNum, logEntries]) => {
        const page = parseInt(pageNum, 10);
        tracelogRefs[page].value = logEntries;
      });
    }

    const entryId = getQueryString(query, 'id');
    if (entryId) {

      watchOnceFor(pageViewers, (pageViewersDiv) => {
        getArtifactData(entryId, 'textgrid')
          .then((textgrid: GridTypes.Grid) => {

            _.each(textgrid.pages, (page, pageNumber) => {
              const mount = document.createElement('div');
              pageViewersDiv.appendChild(mount);
              const mountRef = divRef();
              mountRef.value = mount;

              const logEntryRef: Ref<LogEntry[]> = ref([]);
              tracelogRefs[pageNumber] = logEntryRef;

              useTracelogPdfPageViewer({
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

      getArtifactData(entryId, 'tracelog', 'tracelog')
        .then(tracelogJson => {
          logEntryGroups = groupTracelogsByKey(tracelogJson);
          const choices = _.map(logEntryGroups, ({ groupKey }) => groupKey);
          choicesRef.value = choices;
        });

      provide(ProvidedChoices, choicesRef);

    }

    return {
      mountPoint,
      pageViewers,
      onItemsSelected,
      onItemsReset,
    }
  }
})
