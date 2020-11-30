import { defineComponent } from '@vue/composition-api'
import { isRight } from 'fp-ts/lib/Either'
import { useTranscriptViewer } from '../../transcript-viewer'
import { initState } from '~/components/basics/component-basics'
import { divRef } from '~/lib/vue-composition-lib'
import { getArtifactData } from '~/lib/axios'
import { Transcript } from '~/lib/transcript'

export default defineComponent({
  components: {},
  setup() {
    const state = initState()
    const mountPoint = divRef()

    useTranscriptViewer({ mountPoint, state })
      .then((transcriptionViewer) => {
        const { setText } = transcriptionViewer

        const entryId = '1503.00580.pdf.d'
        // TODO get /transcript
        getArtifactData(entryId, 'textgrid')
          .then((transcriptJson) => {
            const transEither = Transcript.decode(transcriptJson)

            if (isRight(transEither)) {
              const trans = transEither.right
              const page0 = trans.pages[0]
              setText({ trPage: page0, textMarginLeft: 20, textMarginTop: 20 })
            }
          })
      })

    return {
      mountPoint
    }
  }
})
