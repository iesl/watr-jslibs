
// import {
//   ref,
//   Ref,
// } from '@vue/composition-api';

import { initState, waitFor } from '~/components/compositions/component-basics';
import { useTracelogViewer } from '~/components/widgets/tracelog-viewer/tracelog-viewer';
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
