import {
  ref,
  Ref
} from '@vue/composition-api'

import _ from 'lodash';
import * as E from 'fp-ts/lib/Either'
import { PathReporter } from 'io-ts/lib/PathReporter'
import { initState } from '~/components/basics/component-basics'
import { usePdfPageViewer } from '~/components/single-pane/pdf-page-viewer'
import { resolveCorpusUrl, getArtifactData } from '~/lib/axios'
import { LogEntry } from '~/lib/transcript/tracelogs'
import { Transcript } from '~/lib/transcript/transcript'
import { TranscriptIndex } from '~/lib/transcript/transcript-index';

export default {
  setup() {
    const state = initState()

    const mountPoint: Ref<HTMLDivElement | null> = ref(null)
    const logEntryRef: Ref<LogEntry[]> = ref([])

    // const entryId = '1503.00580.pdf.d'
    const entryId = 'austenite.pdf.d'
    const pageNumber = 1;
    const pageImageNumber = (pageNumber+1).toString();

    const run = async () => {

      console.log('starting fetch');
      getArtifactData(entryId, 'transcript')
        .then(async (transcriptJson) => {
          console.log('fetched');
          const maybeDecoded = Transcript.decode(transcriptJson)
          console.log('decoded');
          if (E.isLeft(maybeDecoded)) {
            const report = PathReporter.report(maybeDecoded)
            console.log('error decoding transcript');
            _.each(report, r => {
              console.log('Error:', r);

            })
            return;
          } else {
            const transcript = maybeDecoded.right

            const transcriptIndex = new TranscriptIndex(transcript);
            const page0 = transcript.pages[pageNumber];
            const pageBounds = page0.bounds;

            const pdfPageViewer = await usePdfPageViewer({
              mountPoint,
              state,
              transcriptIndex,
              pageNumber,
              entryId,
              logEntryRef,
            });

            const { superimposedElements } = pdfPageViewer
            const imageUrl = resolveCorpusUrl(entryId, 'image', pageImageNumber)
            superimposedElements.setImageSource(imageUrl);
            superimposedElements.setDimensions(pageBounds.width, pageBounds.height);
          }
        })

    };

    run();

    return {
      mountPoint
    }
  }
}
