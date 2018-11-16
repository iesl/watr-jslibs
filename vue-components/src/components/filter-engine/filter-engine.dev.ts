import Vue from 'vue';
import $ from 'jquery';

import FilterWidget from './filter-engine.vue';
// import filterEngineState from './filter-engine-state';

import { candidateGroupF } from './dev-helpers';

import { CandidateGroup, KeyedRecordGroup } from './FilterEngine';


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

export default Vue.extend({
  name: 'FilterEngineDev',

  data() {
    return {
    };
  },

  props: {
  },

  components: {
    FilterWidget,
  },

  created() {
  },

  methods: {

    onFilterUpdate() {
      console.log('onFilterUpdate');
    },

  },

  watch: {

  },

  computed: {

    filteredRecords(): KeyedRecordGroup[] {
      const { filteredRecords } = this.$store.state.filteringState;
      return filteredRecords;
    },

    initialCandidates(): CandidateGroup[] {
      const groups: CandidateGroup[] = [];

      const qwer = $.getJSON('http://localhost:3100/tracelog-2.json', (tracelogs: LogEntry[]) => {
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

        this.$store.commit('filteringState/setInitialCandidatesReady');

      }, (err) => {
        console.log('err', err);
      });

      return groups;
    }

  },

  mounted() {

  }
});










// $.getJSON('http://localhost:3100/tracelog-2.json', (tracelogs: LogEntry[]) => {
//   const g: CandidateGroup = {
//     candidates: tracelogs,
//     groupKeyFunc: (l: LogEntry) => ({ multikey: ['trace', `p${l.page+1}. ${l.headers.callSite} ${l.headers.tags}`], displayTitle: 'todo' })
//   };

//   this.$store.dispatch('filteringState/addCandidates', g);


//   const candidates1 = candidateGroupF('foo', 'alex', (g) => {
//     const r = { candidate: {}, multikey: ['annot', g.name, g.tags], displayTitle: g.logType };
//     return r;
//   });


//   this.$store.dispatch('filteringState/addCandidates', candidates1);
// }, (err) => {
//   console.log('err', err);
// });

// TODO npm install search-query-parser
