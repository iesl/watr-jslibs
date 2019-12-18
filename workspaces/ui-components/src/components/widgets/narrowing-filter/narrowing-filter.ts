import _ from 'lodash';

import {
  SelectionFilteringEngine,
  CandidateGroup as CandidateGroupT,
  KeyedRecordGroup as KeyedRecordGroupT,
} from "~/lib/FilterEngine";
import { ref, watch, Ref, createComponent, inject, onMounted  } from '@vue/composition-api';
import { ILogEntry } from '~/lib/tracelogs';

export const ProvidedCandidates = 'ProvidedCandidates';

type CandidateGroup = CandidateGroupT<ILogEntry>;
type KeyedRecordGroup = KeyedRecordGroupT<ILogEntry>;

export default createComponent({
  setup() {

    const currSelectionRef = ref([] as string[])
    const queryTextRef = ref('');
    const resetButton = ref(0);
    const candidatesRef: Ref<CandidateGroup|null> = inject(ProvidedCandidates, ref(null))

    onMounted(() => {

      watch(candidatesRef, (candidates) => {
        if (!candidates) return;
        const selectionFilter = new SelectionFilteringEngine([candidates]);

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
