import _ from 'lodash';

import { SelectionFilteringEngine, CandidateGroup, KeyedRecordGroup } from "~/lib/FilterEngine";
import { ILogEntry } from '~/lib/dev-helpers';
import { ref, watch } from '@vue/composition-api';

import { configAxios } from '~/lib/axios';


function createFilter(cgs: CandidateGroup[]) {
  return new SelectionFilteringEngine(cgs);
}

function setup() {
  const componentRoot = ref(null)
  const currSelection: string[] = [];
  const currSelectionRef = ref(currSelection)

  const queryTextRef = ref('');
  let selectionFilter: SelectionFilteringEngine;
  const ready = ref(false);

  configAxios().get('/tracelogs/tracelog.json')
    .then(resp => {
      const tracelogJson = resp.data;

      const groups: CandidateGroup = {
        candidates: tracelogJson,
        groupKeyFunc: (l: ILogEntry) => ({
          multikey: ["trace", `p${l.page+1}. ${l.headers.callSite} ${l.headers.tags}`],
          displayTitle: "todo"
        })
      };

      selectionFilter = createFilter([groups]);
      ready.value = true;

      return groups;

    });

  watch(ready, (b) => {
    if (!b) return;

    watch(queryTextRef, (queryText) => {
      const res: KeyedRecordGroup[] = selectionFilter.query(queryText)
      const display = _.map(res, r => `(${r.records.length}) ${r.keystr}`);
      currSelectionRef.value = display;
    });

  });

  return {
    componentRoot,
    currSelectionRef,
    queryTextRef,
  }
}

export default {
  setup
}
