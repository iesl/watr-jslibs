/**
  */
import _ from 'lodash';

import {
  // reactive,
  // onMounted,
  // onUnmounted,
  Ref,
  // ref,
  // watch,
  // onTrigger,
  // onTrack,
} from '@vue/composition-api';

import { StateArgs, waitFor } from '~/components/compositions/component-basics'
import { usePdfPageViewer } from '~/components/compositions/pdf-page';
import { divRef } from '~/lib/vue-composition-lib';

export interface TracelogViewer {
}

type Args = StateArgs & {
  mountPoint: Ref<HTMLDivElement|null>;
};

export function useTracelogViewer({
  state,
  mountPoint,
}: Args): TracelogViewer {

  const pageViewerMount = divRef();
  const selectionFilterMount = divRef();

  const pdfPageViewer = usePdfPageViewer({ mountPoint: pageViewerMount, state });

  waitFor('TracelogViewer', {
    state,
  }, () => {

  });
  return {
    pageViewerMount,
    selectionFilterMount,
  }
}
