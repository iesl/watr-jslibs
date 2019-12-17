import _ from 'lodash';

import { SelectionFilteringEngine, CandidateGroup, KeyedRecordGroup } from "~/lib/FilterEngine";
import { ref, watch, Ref, createComponent, SetupContext, computed } from '@vue/composition-api';
import { StateArgs, waitFor } from '~/components/compositions/component-basics';


function createFilter(cgs: CandidateGroup[]) {
  return new SelectionFilteringEngine(cgs);
}


export interface NarrowingFilter {
  candidateGroupRef: Ref<CandidateGroup|null>;
}

type Args = StateArgs & {
  mountPoint: Ref<HTMLDivElement|null>;
};

export function useNarrowingFilter({
  state,
  mountPoint
}: Args) {

  const candidateGroupRef: Ref<CandidateGroup|null> = ref(null);


  const componentRoot = ref(null)
  const currSelection: string[] = [];
  const currSelectionRef = ref(currSelection)

  const queryTextRef = ref('');
  let selectionFilter: SelectionFilteringEngine;

  computed(() => {

  });

  watch(candidateGroupRef, (candidateGroup) => {
    if (!candidateGroup) return;
    console.log('candidateGroup set');
    selectionFilter = createFilter([candidateGroup]);

    watch(queryTextRef, (queryText) => {
      const res: KeyedRecordGroup[] = selectionFilter.query(queryText)
      const display = _.map(res, r => `(${r.records.length}) ${r.keystr}`);
      console.log('query returned', display);
      currSelectionRef.value = display;
    });

  });

  return {
    mountPoint,
    componentRoot,
    currSelectionRef,
    queryTextRef,
    candidateGroupRef,
  };
}

export default createComponent({
  props: {
    // queryTextRef: this.queryTextRef,
    // currSelectionRef: this.currSelectionRef,
    // candidateGroupRef:this.candidateGroupRef
  },
  data() {
    return {
    }
  }
});
