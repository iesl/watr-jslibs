import _ from 'lodash'

import {
  Ref,
  defineComponent,
  provide,
  ref,
  SetupContext
} from '@vue/composition-api'

import { divRef } from '~/lib/vue-composition-lib'
import { initState, watchOnceFor } from '~/components/basics/component-basics'
import NarrowingFilter from '~/components/single-pane/narrowing-filter/index.vue'
import { ProvidedChoices } from '~/components/single-pane/narrowing-filter/narrowing-filter'
import { groupTracelogsByKey, LogEntryGroup, LogEntry } from '~/lib/transcript/tracelogs'
import { TranscriptIndex } from '~/lib/transcript/transcript-index'

import { pipe } from 'fp-ts/lib/pipeable';
import * as TE from 'fp-ts/lib/TaskEither';
import { fetchAndDecodeTracelog, fetchAndDecodeTranscript } from '~/lib/data-fetch'
import { useTracelogPdfPageViewer } from '~/components/single-pane/tracelog-viewer'

type Dictionary<T> = { [key: string]: T }
type QObject = Dictionary<string | (string | null)[]>;

export function getQueryString(queryObject: QObject, key: string): string | undefined {
  const qval = queryObject[key]
  if (typeof qval === 'string') {
    return qval
  }
  return undefined
}

export interface TracelogViewer {
  pageViewerMount: Ref<HTMLDivElement | null>;
}

export default defineComponent({
  components: { NarrowingFilter },

  setup(_props, context: SetupContext) {
    const pageViewers = divRef()
    const mountPoint = divRef()
    const state = initState()

    const choicesRef: Ref<Array<string> | null> = ref(null)
    const tracelogRefs: Array<Ref<LogEntry[]>> = []
    let logEntryGroups: LogEntryGroup[] = []

    const onItemsReset = () => {
      _.each(tracelogRefs, (r) => {
        if (r.value.length > 0) {
          r.value = []
        }
      })
    }

    const onItemsSelected = (selection: string[]) => {
      const selectedGroups = _.filter(logEntryGroups, g => _.includes(selection, g.groupKey))
      const selGroupsByPage = _(selectedGroups)
        .flatMap(g => g.logEntries)
        .groupBy(e => e.page)
        .value()

      _.each(_.toPairs(selGroupsByPage), ([pageNum, logEntries]) => {
        const page = parseInt(pageNum, 10)
        tracelogRefs[page].value = logEntries
      })
    }

    const query = { id: 'austenite.pdf.d' }
    const entryId = getQueryString(query, 'id')



    if (entryId) {

      watchOnceFor(pageViewers, (pageViewersDiv) => {

        const run = pipe(
          TE.right({ entryId }),
          TE.bind('tracelog', ({ entryId }) => fetchAndDecodeTracelog(entryId)),
          TE.bind('transcript', ({ entryId }) => fetchAndDecodeTranscript(entryId)),
          TE.bind('transcriptIndex', ({ transcript }) => TE.right(new TranscriptIndex(transcript))),
          TE.mapLeft(errors => {
            _.each(errors, error => console.log('error', error));
            return errors;
          }),
          TE.map(({ tracelog, transcript, transcriptIndex }) => {
            _.each(transcript.pages, (page, pageNumber) => {
              const mount = document.createElement('div')
              pageViewersDiv.appendChild(mount)
              const mountRef = divRef()
              mountRef.value = mount

              const logEntryRef: Ref<LogEntry[]> = ref([])
              tracelogRefs[pageNumber] = logEntryRef

              useTracelogPdfPageViewer({
                mountPoint: mountRef,
                transcriptIndex,
                pageNumber,
                entryId,
                logEntryRef,
                state
              });
            });


            logEntryGroups = groupTracelogsByKey(tracelog);
            const choices = _.map(logEntryGroups, ({ groupKey }) => groupKey);
            choicesRef.value = choices;
          })
        );

        run().then(() => undefined);

      });

      provide(ProvidedChoices, choicesRef)
    }

    return {
      mountPoint,
      pageViewers,
      onItemsSelected,
      onItemsReset
    }
  }
})
