import _ from 'lodash'

import {
  Ref,
  defineComponent,
  provide,
  ref,
  SetupContext
} from '@vue/composition-api'

import { isRight } from 'fp-ts/lib/Either'
import { PathReporter } from 'io-ts/lib/PathReporter'
import { useTracelogPdfPageViewer } from '~/components/single-pane/pdf-page-viewer'
import { divRef } from '~/lib/vue-composition-lib'
import { initState, watchOnceFor } from '~/components/basics/component-basics'
import NarrowingFilter from '~/components/single-pane/narrowing-filter/index.vue'
import { ProvidedChoices } from '~/components/single-pane/narrowing-filter/narrowing-filter'
import { getArtifactData } from '~/lib/axios'
import { groupTracelogsByKey, LogEntryGroup, LogEntry, Tracelog } from '~/lib/transcript/tracelogs'
import { Transcript } from '~/lib/transcript/transcript'

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

    // context

    // const { query } = context.root.$route;
    const choicesRef: Ref<Array<string> | null> = ref(null)
    const tracelogRefs: Array<Ref<LogEntry[]>> = []
    let logEntryGroups: LogEntryGroup[] = []

    const onItemsReset = () => {
      //
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

    const query = { id: '1503.00580.pdf.d' }
    const entryId = getQueryString(query, 'id')
    if (entryId) {
      watchOnceFor(pageViewers, (pageViewersDiv) => {
        getArtifactData(entryId, 'textgrid')
          .then((transcriptJson) => {
            const transEither = Transcript.decode(transcriptJson)

            if (isRight(transEither)) {
              const trans = transEither.right

              _.each(trans.pages, (page, pageNumber) => {
                const mount = document.createElement('div')
                pageViewersDiv.appendChild(mount)
                const mountRef = divRef()
                mountRef.value = mount

                const logEntryRef: Ref<LogEntry[]> = ref([])
                tracelogRefs[pageNumber] = logEntryRef

                useTracelogPdfPageViewer({
                  mountPoint: mountRef,
                  pageNumber,
                  entryId,
                  logEntryRef,
                  pageBounds: page.bounds,
                  state
                })
              })
            } else {
              const report = PathReporter.report(transEither)
              console.log('error decoding textgrid', report)
            }
          })
      })

      getArtifactData(entryId, 'tracelog', 'tracelog')
        .then((tracelogJson) => {
          console.log('got tracelog json', tracelogJson)
          const tracelogEither = Tracelog.decode(tracelogJson)
          if (isRight(tracelogEither)) {
            const tracelog = tracelogEither.right
            console.log('got tracelog', tracelog)
            logEntryGroups = groupTracelogsByKey(tracelog)
            const choices = _.map(logEntryGroups, ({ groupKey }) => groupKey)
            choicesRef.value = choices
          } else {
            const report = PathReporter.report(tracelogEither)
            console.log('error decoding tracelog', report)
          }
        })

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
