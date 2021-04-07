import {
  ref,
  Ref
} from '@vue/composition-api'

import _ from 'lodash';
import { initState } from '~/components/basics/component-basics'
import { usePdfPageViewer } from '~/components/single-pane/pdf-page-viewer'
import { TranscriptIndex } from '~/lib/transcript/transcript-index';

import { pipe } from 'fp-ts/lib/pipeable';
import * as TE from 'fp-ts/lib/TaskEither';
import { fetchAndDecodeTranscript } from '~/lib/data-fetch'
import { getURLQueryParam } from '~/lib/url-utils';

export default {
  setup() {
    const state = initState()
    const mountPoint: Ref<HTMLDivElement | null> = ref(null)

    const entryId = getURLQueryParam('id') || 'missing-id';
    const pageNumber = 1;

    let uri = window.location.search.substring(1);
    let params = new URLSearchParams(uri);
    console.log('id', params.get('id'));

    const run = pipe(
      TE.right({ entryId }),
      TE.bind('transcript', ({ entryId }) => fetchAndDecodeTranscript(entryId)),
      TE.bind('transcriptIndex', ({ transcript }) => TE.right(new TranscriptIndex(transcript))),
      TE.mapLeft(errors => {
        _.each(errors, error => console.log('error', error));
        return errors;
      }),
      TE.map(({ transcriptIndex }) => {
        usePdfPageViewer({
          mountPoint,
          state,
          transcriptIndex,
          pageNumber,
          entryId,
        });
      })
    );

    run();

    return {
      mountPoint
    }
  }
}
