/**
 *
 */

import _ from 'lodash';

import {
  SelectionFilteringEngine,
} from './FilterEngine';

// import * as rx from "rxjs";
import Vue from 'vue';
import feState from './filter-engine-state';
// feState.state().candidates

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
    // Populate #trace-menu-hits with :
    //   self.makeUL(self.getCountedTitles())
    //   getCountedTitles(): return this.formatKeyedRecordGroups(this.filteringEngine.getKeyedRecordGroups());

  },
  data: function() {
    // let selectionCandidates: SelectionCandidates = [];
    return feState;
    // return {
    //   ...feState,
    // }
  }
});
