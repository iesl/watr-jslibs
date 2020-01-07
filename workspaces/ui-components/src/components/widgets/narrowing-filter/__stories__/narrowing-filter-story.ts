import _ from 'lodash';

import NarrowingFilter from '../index.vue';
import { ProvidedCandidates } from '../narrowing-filter';
import { ref, onMounted, createComponent, provide, Ref } from '@vue/composition-api';
import { configAxios } from '~/lib/axios';
import { CandidateGroup as CandidateGroupT } from '~/lib/FilterEngine';
import { ILogEntry } from '~/lib/tracelogs';
import Layout from '~/components/story-templates/titled-frame-template/index.vue';


type CandidateGroup = CandidateGroupT<ILogEntry>;
export default createComponent({
  setup() {
    const candidatesRef: Ref<CandidateGroup|null> = ref(null)
    provide(ProvidedCandidates, candidatesRef);

    onMounted(() => {

      configAxios().get('/tracelogs/tracelog.json')
        .then(resp => {
          const tracelogJson = resp.data;

          const groups: CandidateGroup = {
            candidates: tracelogJson,
            groupKeyFunc: (l: ILogEntry) => ({
              multikey: ["trace", `p${l.page+1}. ${l.headers.callSite} ${l.headers.tags}`]
            })
          };
          candidatesRef.value = groups;
        });

    })


    return {
      candidatesRef
    }
  },
  components: {
    NarrowingFilter,
    Layout
  },
});

