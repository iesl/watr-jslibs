
// import {
//   ref,
//   Ref,
// } from '@vue/composition-api';

import { initState, waitFor } from '~/components/basics/component-basics';
import { useTracelogViewer } from '~/components/ui-elements/tracelog-viewer/tracelog-viewer';
import TracelogViewer from '~/components/ui-elements/tracelog-viewer/index.vue';
import { divRef } from '~/lib/vue-composition-lib';


export default {
  components: { TracelogViewer },
  setup() {

    const state = initState();

    const tracelogViewerMount = divRef();
    const tracelogViewer = useTracelogViewer({ mountPoint: tracelogViewerMount, state });
    const { pageViewerMount } = tracelogViewer;

    // const { setTracelog, } = tracelogViewer;
    //


    waitFor('TracelogViewerStory', { state }, () => {
    });

    return {
      tracelogViewerMount,
      pageViewerMount
    };
  }
}
