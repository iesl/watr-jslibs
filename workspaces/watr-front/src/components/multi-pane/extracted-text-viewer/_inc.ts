import _ from 'lodash'

import {
  defineComponent,
  SetupContext,
  ref,
  Ref
} from '@vue/composition-api'

import { isRight } from 'fp-ts/lib/Either'
import { getQueryString } from '../tracelog-viewer/tracelog-viewer'
import { divRef } from '~/lib/vue-composition-lib'
import { initState, awaitRef } from '~/components/basics/component-basics'
import { getArtifactData } from '~/lib/axios'
import { LogEntry } from '~/lib/transcript/tracelogs'
import { useTracelogPdfPageViewer } from '~/components/single-pane/pdf-page-viewer'
import { useTranscriptViewer } from '~/components/single-pane/transcript-viewer'
import { Transcript } from '~/lib/transcript/transcript'

export default defineComponent({

  setup(_props, context: SetupContext) {
    const pageViewers = divRef()
    const pageTexts = divRef()
    const state = initState()

    // const { query } = context.root.$route;
    // const entryId = getQueryString(query, 'id');
    const entryId = '1503.00580.pdf.d';

    if (entryId) {
      awaitRef(pageTexts).then((pageTextsDiv) => {
        getArtifactData(entryId, 'textgrid')
          .then((transcriptJson) => {
            const transEither = Transcript.decode(transcriptJson)

            if (isRight(transEither)) {
              const transcript = transEither.right

              _.each(transcript.pages, async (page, pageNumber) => {
                const tmount = document.createElement('div')
                pageTextsDiv.appendChild(tmount)
                const tmountRef = divRef()
                tmountRef.value = tmount
                const transcriptViewer = await useTranscriptViewer({ mountPoint: tmountRef, state })
                const { setText } = transcriptViewer
                setText({ trPage: page, textMarginLeft: 20, textMarginTop: 20 })

                const mount = document.createElement('div')
                const pageViewersDiv = await awaitRef(pageViewers)
                pageViewersDiv.appendChild(mount)
                const mountRef = divRef()
                mountRef.value = mount

                const logEntryRef: Ref<LogEntry[]> = ref([])

                await useTracelogPdfPageViewer({
                  mountPoint: mountRef,
                  pageNumber,
                  entryId,
                  logEntryRef,
                  pageBounds: page.bounds,
                  state
                })
              })
            }
          })
      })
    }
    return {
      pageViewers,
      pageTexts
    }
  }

})
