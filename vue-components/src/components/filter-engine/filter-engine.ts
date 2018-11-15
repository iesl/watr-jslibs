/**
 *
 */

import * as _ from 'lodash';

import Vue from 'vue';

import { mapState } from 'vuex';
import {
  SelectionFilteringEngine,
  CandidateGroup,
  KeyedRecordGroup,
} from './FilterEngine';


function getFilteringEngine(v: any): SelectionFilteringEngine {
  return v.$_selectionFilteringEngine;
}
function setFilteringEngine(v: any, e: SelectionFilteringEngine): void {
  v.$_selectionFilteringEngine = e;
}
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
      const { currentSelections } = this.$store.state.filteringState;
      this.$store.commit('filteringState/setFilteredRecords', currentSelections);
    },
  },

  created() {
    const store = this.$store;

    setFilteringEngine(this, new SelectionFilteringEngine([]));

    const qfunc = () => {
      const filteringEngine = getFilteringEngine(this);
      const hitRecs = filteringEngine.query(this.queryString);
      store.commit('filteringState/setCurrentSelections', hitRecs);
    };

    const debouncedQfunc: (() => void) & _.Cancelable = _.debounce(qfunc, 350);
    this.query = debouncedQfunc;
  },

  watch: {

    queryString() {
      this.query();
    },

    currentSelections() {
    },

    allCandidateGroups() {
      console.log('watch: allCandidateGroups');
      const filteringEngine = getFilteringEngine(this);
      const { allCandidateGroups } = this.$store.state.filteringState;
      console.log('computed: allCandidateGroups', filteringEngine, allCandidateGroups);
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
      queryString: ''
    };
  }
});

export default component;
