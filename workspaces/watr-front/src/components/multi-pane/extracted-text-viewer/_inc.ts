import _ from 'lodash'

import {
  defineComponent,
  SetupContext,
  ref,
  Ref
} from '@vue/composition-api'

import { isRight } from 'fp-ts/lib/Either'
import { divRef } from '~/lib/vue-composition-lib'
import { initState, awaitRef, watchOnceFor } from '~/components/basics/component-basics'
import { getArtifactData } from '~/lib/axios'
import { LogEntry } from '~/lib/transcript/tracelogs'
import { usePdfPageViewer } from '~/components/single-pane/pdf-page-viewer'
import { Transcript } from '~/lib/transcript/transcript'
import { useStanzaViewer } from '~/components/single-pane/pdf-text-viewer'
import { TranscriptIndex } from '~/lib/transcript/transcript-index'

import { pipe } from 'fp-ts/lib/pipeable';
import * as TE from 'fp-ts/lib/TaskEither';
import * as E from 'fp-ts/lib/Either';
import { fetchAndDecodeTranscript } from '~/lib/data-fetch'

export default defineComponent({

  setup(_props, _context: SetupContext) {
    const pageViewers = divRef()
    const pageTexts = divRef()
    const state = initState()

    const entryId = 'austenite.pdf.d';

    if (entryId) {

      const run = pipe(
        TE.right({ entryId }),
        TE.bind('pageTextsDiv', ({ }) => () => awaitRef(pageTexts).then(d => E.right(d))),
        TE.bind('pageViewersDiv', ({ }) => () => awaitRef(pageViewers).then(d => E.right(d))),
        TE.bind('transcript', ({ entryId }) => fetchAndDecodeTranscript(entryId)),
        TE.bind('transcriptIndex', ({ transcript }) => TE.right(new TranscriptIndex(transcript))),
        TE.mapLeft(errors => {
          _.each(errors, error => console.log('error', error));
          return errors;
        }),
        TE.map(({ pageTextsDiv, pageViewersDiv, transcript, transcriptIndex }) => {
          _.each(transcript.pages, (page, pageNumber) => {
            const mount = document.createElement('div')
            pageViewersDiv.appendChild(mount)
            const mountRef = divRef()
            mountRef.value = mount

            usePdfPageViewer({
              mountPoint: mountRef,
              transcriptIndex,
              pageNumber,
              entryId,
              state
            });

          });

          _.each(transcript.stanzas, (stanza, stanzaNumber) => {
            const mount = document.createElement('div')
            const mountRef = divRef()
            mountRef.value = mount
            pageTextsDiv.appendChild(mount)
            useStanzaViewer({ mountPoint: mountRef, state })
              .then(stanzaViewer => {
                stanzaViewer.showStanza(transcriptIndex, stanzaNumber);
              });
          });

        })
      );

      run().then(() => undefined);
    }
    return {
      pageViewers,
      pageTexts
    }
  }

})
