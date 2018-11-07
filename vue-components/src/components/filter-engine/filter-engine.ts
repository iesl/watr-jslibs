/**
 *
 */

import * as _ from 'lodash';

import Vue, {
  // ComponentOptions,
} from 'vue';

import { FilteringState } from './filter-engine-state';

import {
  CandidateGroup,
  KeyedRecordGroup,
} from "./FilterEngine";


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
      const { currentSelections } = this.$store.getters['filteringState/all']
      this.$store.commit('filteringState/setFilteredRecords', currentSelections);
    },
  },

  created() {
    console.log('created');

    const store = this.$store;

    const qfunc = () => {
      const { filteringEngine, allCandidateGroups } = store.getters['filteringState/all']
      const hitRecs = filteringEngine.query(this.queryString);
      this.$store.commit('filteringState/setCurrentSelections', hitRecs);
    }

    const debouncedQfunc: (() => void) & _.Cancelable = _.debounce(qfunc, 350)
    this.query = debouncedQfunc;

  },

  watch: {

    queryString () {
      this.query();
    },

    allCandidateGroups: () => {}

  },

  computed: {

    currentSelections(): KeyedRecordGroup[] {
      const { currentSelections } = this.$store.getters['filteringState/all']
      return currentSelections;
    },

    allCandidateGroups(): CandidateGroup  {
      const { filteringEngine, allCandidateGroups } = this.$store.getters['filteringState/all']
      filteringEngine.setCandidateGroups(allCandidateGroups);
      const recordGroups = filteringEngine.getKeyedRecordGroups();
      this.$store.commit('filteringState/setCurrentSelections', recordGroups);
      return allCandidateGroups;
    }

  },


  data() {
    return {
      queryString: ""
    };
  }
});

export default component;

