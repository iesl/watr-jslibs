
import $ from 'jquery';

import {
  Vue,
  Component,
} from 'vue-property-decorator'

import {
  namespace
} from 'vuex-class'


import FilterWidget from './filter-engine.vue';

import { candidateGroupF } from '@/lib/dev-helpers';
import { CandidateGroup, KeyedRecordGroup } from '@/lib/FilterEngine';

const filterState = namespace('filteringState')

interface Headers {
  tags: string;
  name: string;
  callSite: string;
}

interface LogEntry {
  logType: string;
  page: number;
  headers: Headers;
}

@Component({
  components: {
    FilterWidget,
  }
})
export default class FilterEngineDev extends Vue {

  @filterState.State filteredRecords!: KeyedRecordGroup[];
  @filterState.Mutation('setInitialCandidatesReady') setInitialCandidatesReady!: () => void;

  get initialCandidates(): CandidateGroup[] {
    const groups: CandidateGroup[] = [];

    $.getJSON('http://localhost:3100/tracelogs/tracelog-2.json', (tracelogs: LogEntry[]) => {
      const g: CandidateGroup = {
        candidates: tracelogs,
        groupKeyFunc: (l: LogEntry) => ({ multikey: ['trace', `p${l.page+1}. ${l.headers.callSite} ${l.headers.tags}`], displayTitle: 'todo' })
      };

      groups.push(g);

      const candidates1 = candidateGroupF('foo', 'alex', (g) => {
        const r = { candidate: {}, multikey: ['annot', g.name, g.tags], displayTitle: g.logType };
        return r;
      });

      groups.push(candidates1);

      this.setInitialCandidatesReady();

    }, (err) => {
      console.log('err', err);
    });

    return groups;
  }

}
