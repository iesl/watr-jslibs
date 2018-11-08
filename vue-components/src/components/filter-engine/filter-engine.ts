/**
 *
 */

import * as _ from 'lodash';

import Vue from 'vue';

// import { FilteringState } from './filter-engine-state';

import {
  CandidateGroup,
  KeyedRecordGroup,
} from "./FilterEngine";
import { mapState } from 'vuex';


const component = Vue.extend({
  name: 'FilterWidget',
  components: {},

  props: {
  },

  methods: {
    query(): void {
    },

    filterReset(): void {
      this.$store.commit('filteringState/setFilteredRecords', []);
    },

    filterUpdated(): void {
      // const { currentSelections } = this.$store.getters['filteringState/all']
      const { currentSelections } = this.$store.state.filteringState;
      this.$store.commit('filteringState/setFilteredRecords', currentSelections);
    },
  },

  created() {

    const store = this.$store;

    const qfunc = () => {
      // const { filteringEngine } = store.getters['filteringState/all']
      const { filteringEngine } = this.$store.state.filteringState;
      const hitRecs = filteringEngine.query(this.queryString);
      store.commit('filteringState/setCurrentSelections', hitRecs);
    }

    const debouncedQfunc: (() => void) & _.Cancelable = _.debounce(qfunc, 350)
    this.query = debouncedQfunc;

  },

  watch: {

    queryString() {
      console.log('watch: queryString');
      this.query();
    },

    allCandidateGroups() {
      console.log('watch: allCandidateGroups');
      const { filteringEngine, allCandidateGroups } = this.$store.state.filteringState;
      console.log('computed: allCandidateGroups', this.$store.state.filteringState);
      filteringEngine.setCandidateGroups(allCandidateGroups);
      const recordGroups = filteringEngine.getKeyedRecordGroups();
      this.$store.commit('filteringState/setCurrentSelections', recordGroups);
    }

  },

  computed: {
    ...mapState('filteringState', [
      'currentSelections',
      'allCandidateGroups',
      'filteredRecords'
    ]),
  },


  data() {
    return {
      queryString: ""
    };
  }
});

export default component;
