/**
 *
 */

import _ from 'lodash';
import Vue from 'vue';

import {
  SelectionFilteringEngine,
} from './FilterEngine';

import feState from './filter-engine-state';

export default Vue.extend({
  name: 'FilterWidget',
  components: {},
  props: {

    filteringEngine: {
      type: SelectionFilteringEngine,
      default: () => { return new SelectionFilteringEngine([]); }
    }

  },

  created() {

  },

  watch: {

    'state.candidateGroups': function (val, oldVal) {
      console.log('new candidateGroup', val, oldVal);
      const engine: SelectionFilteringEngine = this.$props.filteringEngine;
      engine.setCandidateGroups(val);
      const recordGroups = engine.getKeyedRecordGroups();
      feState.mod.setSelectedGroups(recordGroups);
    },

    'state.queryString': function (val, oldVal) {
      const engine: SelectionFilteringEngine = this.$props.filteringEngine;
      const hitRecs = engine.query(val);
      feState.mod.setSelectedGroups(hitRecs);
    }
  },

  data: function() {
    return feState;
  }
});
