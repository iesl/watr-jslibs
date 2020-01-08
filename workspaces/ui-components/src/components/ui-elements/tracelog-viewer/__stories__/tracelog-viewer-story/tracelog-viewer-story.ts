
// import {
//   ref,
//   Ref,
// } from '@vue/composition-api';

import { initState, waitFor } from '~/components/basics/component-basics';
import { useTracelogViewer } from '~/components/ui-elements/tracelog-viewer/tracelog-viewer';
import { divRef } from '~/lib/vue-composition-lib';


export default {
  setup() {

    const state = initState();

    const mountPoint = divRef();
    const tracelogViewer = useTracelogViewer({ mountPoint, state });


    waitFor('TracelogViewerStory', { state }, () => {
    });

    return {
      mountPoint
    };
  }
}
