import _ from 'lodash';

import {
  SelectionFilteringEngine,
  CandidateGroup as CandidateGroupT,
  KeyedRecordGroup as KeyedRecordGroupT,
} from "~/lib/FilterEngine";
import { ref, watch, Ref, createComponent, inject, onMounted  } from '@vue/composition-api';
import { ILogEntry } from '~/lib/tracelogs';
import { configAxios } from '~/lib/axios';

// export const ProvidedCandidates = 'ProvidedCandidates';
export const ProvidedCandidatesUrl = 'ProvidedCandidatesUrl';

type CandidateGroup = CandidateGroupT<ILogEntry>;
type KeyedRecordGroup = KeyedRecordGroupT<ILogEntry>;

export default createComponent({
  setup() {

    const currSelectionRef = ref([] as string[])
    const queryTextRef = ref('');
    const resetButton = ref(0);
    const candidatesUrlRef: Ref<string|null> = inject(ProvidedCandidatesUrl, ref(null))


    watch(candidatesUrlRef, (url) => {
      if (!url) return;

      console.log("updating candidates");

      configAxios().get(url)
        .then(resp => {
          console.log("fetched candidates");
          const tracelogJson = resp.data;

          const candidates: CandidateGroup = {
            candidates: tracelogJson,
            groupKeyFunc: (l: ILogEntry) => ({
              multikey: ["trace", `p${l.page+1}. ${l.headers.callSite} ${l.headers.tags}`]
            })
          };


          const selectionFilter = new SelectionFilteringEngine([candidates]);
          console.log("init'd filter");

          const updateSelection = (query: string) => {
            const res: KeyedRecordGroup[] = selectionFilter.query(query)
            const display = _.map(res, r => `(${r.records.length}) ${r.keystr}`);
            currSelectionRef.value = display;
          }
          const debounced = _.debounce(updateSelection, 300);

          watch(queryTextRef, (queryText) => {
            debounced(queryText);
          });

          watch(resetButton, () => {
            queryTextRef.value = '';
            currSelectionRef.value = [];
          });
        });

    });


    return {
      currSelectionRef,
      queryTextRef,
      resetButton
    };

  }
});
