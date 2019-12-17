import _ from 'lodash';

import NarrowingFilter from '../index.vue';
import { useNarrowingFilter } from '../narrowing-filter';
import { ref, onMounted, createComponent, SetupContext } from '@vue/composition-api';
import { configAxios } from '~/lib/axios';
import { initState } from '~/components/compositions/component-basics';
import { CandidateGroup } from '~/lib/FilterEngine';
import { ILogEntry } from '~/lib/dev-helpers';

export default createComponent({
  setup(props, ctx: SetupContext) {
    // <div ref="mountPoint"></div>
    const mountPoint = ref(null)
    const state = initState();
    const narrowingFilter = useNarrowingFilter({ state, mountPoint });
    const { candidateGroupRef, queryTextRef, currSelectionRef } = narrowingFilter;
    onMounted(() => {

      configAxios().get('/tracelogs/tracelog.json')
        .then(resp => {
          const tracelogJson = resp.data;
          console.log('got trace', tracelogJson);

          const groups: CandidateGroup = {
            candidates: tracelogJson,
            groupKeyFunc: (l: ILogEntry) => ({
              multikey: ["trace", `p${l.page+1}. ${l.headers.callSite} ${l.headers.tags}`],
              displayTitle: "todo"
            })
          };

          candidateGroupRef.value = groups;

        });

    })


    return {
      mountPoint,
      // candidateGroupRef,
      queryTextRef,
      currSelectionRef
    }
  },
  components: {
    NarrowingFilter,
  },
});

