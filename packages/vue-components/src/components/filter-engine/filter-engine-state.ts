
import {
  KeyedRecordGroup,
} from './FilterEngine';

import {
  Module,
  GetterTree,
  MutationTree,
  ActionTree,
  Plugin
} from 'vuex';

export class FilteringState {
  currentSelections: KeyedRecordGroup[] = [];
  filteredRecords: KeyedRecordGroup[] = [];
  initialCandidatesReady: Boolean = false;
}

export class FilteringStateModule implements Module<FilteringState, any> {

  namespaced: boolean = true

  state: FilteringState

  actions = <ActionTree<FilteringState, any>> {}

  mutations = <MutationTree<FilteringState>> {
    setCurrentSelections(state: FilteringState, groups: KeyedRecordGroup[]) {
      state.currentSelections = groups;
    },

    setInitialCandidatesReady(state: FilteringState) {
      state.initialCandidatesReady = true;
    },

    setFilteredRecords(state: FilteringState, groups: KeyedRecordGroup[]) {
      state.filteredRecords = groups;
    }
  }

  getters = <GetterTree<FilteringState, any>> {}

  plugins: Plugin<FilteringState>[] = []

  constructor(plugins?: Plugin<FilteringState>[]) {
    this.state = new FilteringState();
    this.plugins = plugins ? plugins : [];
  }
}
