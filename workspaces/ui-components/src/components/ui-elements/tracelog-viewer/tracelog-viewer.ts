/**
  */
import _ from 'lodash';

import {
  Ref,
} from '@vue/composition-api';

import { usePdfPageViewer } from '~/components/compositions/pdf-page';
import { divRef } from '~/lib/vue-composition-lib';
import { StateArgs, initState, waitFor } from '~/components/compositions/component-basics';

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

function setup() {
  const state = initState();

  const mountPoint = divRef();

  return {
    mountPoint
  }
}

export default {
  setup
}
