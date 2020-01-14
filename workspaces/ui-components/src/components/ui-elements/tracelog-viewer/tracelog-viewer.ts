/**
 *
 */

import _ from 'lodash';

import {
  Ref,
} from '@vue/composition-api';


import { usePdfPageViewer } from '~/components/subsystems/pdf-page-viewer';
import { divRef } from '~/lib/vue-composition-lib';
import { StateArgs, waitFor } from '~/components/basics/component-basics';
import NarrowingFilter from '~/components/ui-elements/narrowing-filter/index.vue';

export interface TracelogViewer {
  pageViewerMount: Ref<HTMLDivElement|null>;
}

type Args = StateArgs & {
  mountPoint: Ref<HTMLDivElement|null>;
};

// TODO this should be an assembly perhaps? should it be a .vue? you decide...
export function useTracelogViewer({
  state,
  mountPoint,
}: Args): TracelogViewer {

  const pageViewerMount = divRef();
  // const selectionFilterMount = divRef();

  // One per pdf page: 
  const pdfPageViewer = usePdfPageViewer({ mountPoint: pageViewerMount, state });
  // + tracelog shape viewer
  // + selection filter

  return {
    pageViewerMount
  }
}

function setup() {
  // const state = initState();

  const mountPoint = divRef();

  return {
    mountPoint
  }
}

export default {
  components: { NarrowingFilter },
  setup,
  useTracelogViewer,
}
