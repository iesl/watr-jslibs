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
  emptyCandidateGroup
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
    initialCandidateGroups: {
      type: Array,
      required: true,
      default: () => []
    },

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

  mounted() {
  },

  watch: {
    initialCandidatesReady() {
      // _.each(this.initialCandidateGroups, g => {
      //   console.log("group", g);
      //   this.$store.dispatch('filteringState/addCandidates', g);
      // });

      const filteringEngine = getFilteringEngine(this);
      const { allCandidateGroups } = this.$store.state.filteringState;
      filteringEngine.setCandidateGroups(this.initialCandidateGroups);
      const recordGroups = filteringEngine.getKeyedRecordGroups();
      this.$store.commit('filteringState/setCurrentSelections', recordGroups);

    },

    queryString() {
      this.query();
    },

    currentSelections() {
    },

  },

  computed: {
    ...mapState('filteringState', [
      'currentSelections',
      'filteredRecords',
      'initialCandidatesReady'
    ]),
  },


  data() {
    return {
      queryString: ''
    };
  }
});

export default component;
