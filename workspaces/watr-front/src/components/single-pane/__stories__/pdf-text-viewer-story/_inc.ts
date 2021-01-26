import { defineComponent } from '@vue/composition-api'
import { useStanzaViewer } from '~/components/single-pane/pdf-text-viewer'
import { PathReporter } from 'io-ts/lib/PathReporter'
import * as E from 'fp-ts/lib/Either'
import { getArtifactData } from '~/lib/axios'
import { initState } from '~/components/basics/component-basics'
import { divRef } from '~/lib/vue-composition-lib'
import { Transcript } from '~/lib/transcript/transcript'
import _ from 'lodash';
import { TranscriptIndex } from '~/lib/transcript/transcript-index'

export default defineComponent({
  components: {},
  setup() {
    const state = initState()
    const mountPoint = divRef()

    useStanzaViewer({ mountPoint, state }).then((stanzaViewer) => {
      const { showStanza } = stanzaViewer;

      const entryId = 'austenite.pdf.d';

      getArtifactData(entryId, 'transcript')
        .then(async (transcriptJson) => {
          const maybeDecoded = Transcript.decode(transcriptJson)
          console.log(maybeDecoded)
          if (E.isLeft(maybeDecoded)) {
            const report = PathReporter.report(maybeDecoded)
            console.log('error decoding transcript');
            _.each(report, r => {
              console.log('Error:', r);
            });
            return;
          } else {
            const transcript = maybeDecoded.right
            const transcriptIndex = new TranscriptIndex(transcript);
            showStanza(transcriptIndex, 0);
          }
        });
    });

    return {
      mountPoint
    }
  }
})
