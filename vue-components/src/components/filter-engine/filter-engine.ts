/**
 *
 */

import _ from 'lodash';
import Vue from 'vue';
import { mapMutations, mapState } from 'vuex';

import {
  // SelectionFilteringEngine,
  // CandidateGroup,
  // CandidateGroups
} from './FilterEngine';

import filterEngineState, { FilterEngineState } from './filter-engine-state';


// interface FilterWidgetFields {
//   filteringEngine: SelectionFilteringEngine;
//   debouncedQuery: () => void;
// }

// function extraFields(o: any): FilterWidgetFields {
//   return o as FilterWidgetFields;
// }

// export filterCandidatePlugin(src) {
//       const filterEngine = new SelectionFilteringEngine([]);
//   return (store) => {

//   }
// }


export default Vue.extend({
  name: 'FilterWidget',
  components: {},
  props: {
    // candidateGroups: {
    //   type: CandidateGroups,
    //   default() { return []; },
    // },
    // filteringEngine: {
    //   type: SelectionFilteringEngine,
    //   default() { return new SelectionFilteringEngine([]); }
    // }

  },

  created() {
    console.log('created');
    // extraFields(this).debouncedQuery = _.debounce(this.query, 350);
    // extraFields(this).filteringEngine = new SelectionFilteringEngine([]);
  },

  // self() { return extraFields(this); },

  watch: {

    // 'this.$store.state.filterEngine.candidateGroups'() {

    // candidateGroups: function () {
    //   console.log("watch: candidateGroups");
    //   return filterEngineState.state.candidateGroups;
    // },

    // 'state.candidateGroups': function(val) {
    //   console.log("watch: candidateGroups");
    //   const engine = extraFields(this).filteringEngine;
    //   engine.setCandidateGroups(val);
    //   const recordGroups = engine.getKeyedRecordGroups();
    //   filterEngineState.mutations.setSelectedGroups(recordGroups);
    // },

    queryString () {
      extraFields(this).debouncedQuery();
    },

    // ...mapState({
    //   candidateGroups: (s: {filterEngine: FilterEngineState } ) => {

    //     console.log('watch: s.filterEngine', s.filterEngine);
    //     const groups = s.filterEngine.candidateGroups;
    //     console.log('watch: groups', groups);
    //     return s.filterEngine.candidateGroups;

    //   }
    // })
  },

  computed: {
    selectedGroups() {
      console.log(filterEngineState.state.selectedGroups);
      return filterEngineState.state.selectedGroups;
    },
    ...mapState({
      candidateGroups: (s) => {
        console.log('computed: s', s);
        console.log('computed: s.filterEngine', s.filterEngine);
        const groups = s.filterEngine.candidateGroups;
        console.log('groups', groups);

        // const engine = extraFields(thisComponent).filteringEngine;
        const self = () => () => this;
        const engine = extraFields(self()());
        // const engine = self().filteringEngine;
        console.log('engine', engine);
        // engine.setCandidateGroups(groups);
          // const recordGroups = engine.getKeyedRecordGroups();
        //   filterEngineState.mutations.setSelectedGroups(recordGroups);
        return s.filterEngine.candidateGroups;
      }
    })
  },

  methods: {
    query() {
      const querystr = this.queryString;
      console.log('querying', querystr);
      const engine = extraFields(this).filteringEngine;
      const hitRecs = engine.query(querystr);
      filterEngineState.mutations.setSelectedGroups(hitRecs);
    }

  },

  data() {
    // return filterEngineState;
    return {
      queryString: ''
    };
  }
});

// export default thisComponent;


// 'state.candidateGroups': function (val) {
//   const engine = extraFields(this).filteringEngine;
//   engine.setCandidateGroups(val);
//   const recordGroups = engine.getKeyedRecordGroups();
//   filterEngineState.mod.setSelectedGroups(recordGroups);
// },
// self.makeInlineList(self.filteringEngine.indexTokens)
