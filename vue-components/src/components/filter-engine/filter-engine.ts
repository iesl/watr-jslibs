/**
 *
 */

import _ from 'lodash';

import Vue, {
  // ComponentOptions,
} from 'vue';

// import {
//   mapState
// } from 'vuex';


import { FilteringState } from './filter-engine-state';

import {
  CandidateGroup,
  KeyedRecords,
  // GroupKey
} from "./FilterEngine";


const component = Vue.extend({
  name: 'FilterWidget',
  components: {},
  props: {
    myprop: {

    }
  },

  methods: {
    query(): void {
    }
    // query: (throw new Error("uninitialized query function")) as ((() => void) & _.Cancelable),
    // query: null as any as ((() => void) & _.Cancelable),


  },

  created() {
    console.log('created');

    // debouncedQuery: function q(): ((() => void) & _.Cancelable) {
    // console.log('deb:querying', this.queryString);
    const store = this.$store;

    const qfunc = () => {
      // console.log('querying', querystr, filterEngineState.state.filteringEngine);
      const { filteringEngine, candidateGroups } = store.getters['filteringState/all']
      // console.log('querying this=', this);
      const hitRecs = filteringEngine.query(this.queryString);
      // store.commit
      this.$store.commit('filteringState/setSelectedGroups', hitRecs);

    }

    const debouncedQfunc: (() => void) & _.Cancelable = _.debounce(qfunc, 350)
    this.query = debouncedQfunc;

  },

  watch: {

    queryString () {
      this.query();
    },
    candidateGroups: (s: {filterEngine: FilteringState } ) => {
      // const groups = s.filterEngine.candidateGroups;
      // return s.filterEngine.candidateGroups;
    },

    // ...mapState({
    //   candidateGroups: (s: {filterEngine: FilteringState } ) => {
    //     // const groups = s.filterEngine.candidateGroups;
    //     // return s.filterEngine.candidateGroups;
    //   }
    // })
  },

  computed: {

    selectedGroups(): KeyedRecords[] {
      // const groups = this.$store.getters['filteringState/selectedGroups'];
      const { selectedGroups } = this.$store.getters['filteringState/all']
      console.log('computed:selectedGroups()', selectedGroups);
      return selectedGroups;
    },

    candidateGroups(): CandidateGroup  {
      console.log('computed:candidateGroups');
      // console.log('computed: s.filterEngine', s.filterEngine);
      // this.$store.state
      const { filteringEngine, candidateGroups } = this.$store.getters['filteringState/all']
      console.log('engine', filteringEngine);
      console.log('candidateGroups', candidateGroups);
      filteringEngine.setCandidateGroups(candidateGroups);
      const recordGroups = filteringEngine.getKeyedRecordGroups();
      this.$store.commit('filteringState/setSelectedGroups', recordGroups);
      return candidateGroups;
    }

    // ...mapState({
    //   candidateGroups: function f(s: { filterEngine: FilteringState }) {
    //     // console.log('computed: s', s);
    //     // console.log('computed: s.filterEngine', s.filterEngine);
    //     const engine = s.filterEngine.filteringEngine;
    //     const groups = s.filterEngine.candidateGroups;
    //     // console.log('engine', engine);
    //     // console.log('groups', groups);
    //     engine.setCandidateGroups(groups);
    //     const recordGroups = engine.getKeyedRecordGroups();
    //     // filterEngineState.mutations.setSelectedGroups(recordGroups);
    //     return s.filterEngine.candidateGroups;
    //   }
    // })

  },


  data() {
    return {
      queryString: ""
    };
  }
});

export default component;

