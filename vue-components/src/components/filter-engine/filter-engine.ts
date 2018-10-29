/**
 *
 */

import _ from 'lodash';
import Vue from 'vue';
import { mapMutations, mapState } from 'vuex';


import filterEngineState, { FilterEngineState } from './filter-engine-state';



export default Vue.extend({
  name: 'FilterWidget',
  components: {},
  props: {
  },

  created() {
    console.log('created');
    this.query = this.debouncedQuery();
  },


  watch: {

    // 'state.candidateGroups': function(val) {
    //   console.log("watch: candidateGroups");
    //   const engine = extraFields(this).filteringEngine;
    //   engine.setCandidateGroups(val);
    //   const recordGroups = engine.getKeyedRecordGroups();
    //   filterEngineState.mutations.setSelectedGroups(recordGroups);
    // },

    queryString () {
      this.query();
    },

    ...mapState({
      candidateGroups: (s: {filterEngine: FilterEngineState } ) => {
        // const groups = s.filterEngine.candidateGroups;
        // return s.filterEngine.candidateGroups;

      }
    })
  },

  computed: {
    selectedGroups() {
      console.log(filterEngineState.state.selectedGroups);
      return filterEngineState.state.selectedGroups;
    },

    ...mapState({
      candidateGroups: function f(s: {filterEngineState: FilterEngineState}) {
        // console.log('computed: s', s);
        // console.log('computed: s.filterEngine', s.filterEngine);
        const engine = s.filterEngine.filteringEngine;
        const groups = s.filterEngine.candidateGroups;
        console.log('engine', engine);
        console.log('groups', groups);
        engine.setCandidateGroups(groups);
        const recordGroups = engine.getKeyedRecordGroups();
        filterEngineState.mutations.setSelectedGroups(recordGroups);
        return s.filterEngine.candidateGroups;
      }
    })

  },

  methods: {
    query(): (void & _.Cancelable) {
      throw new Error("uninitialized query function");
    },

    debouncedQuery: function q(): ((() => void) & _.Cancelable) {
      console.log('deb:querying', this.queryString);
      const qfunc = () => {
        const querystr = this.queryString;
        console.log('querying', querystr, filterEngineState.state.filteringEngine);
        const engine = filterEngineState.state.filteringEngine;
        const hitRecs = engine.query(querystr);
        filterEngineState.mutations.setSelectedGroups(hitRecs);
      }

      const debouncedQfunc: (() => void) & _.Cancelable = _.debounce(qfunc, 350)

      return debouncedQfunc;
    }

  },

  data() {
    // return filterEngineState;
    return {
      queryString: filterEngineState.state.queryString
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
