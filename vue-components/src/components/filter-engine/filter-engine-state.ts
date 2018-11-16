
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


function setCurrentSelections(state: FilteringState, groups: KeyedRecordGroup[]) {
  state.currentSelections = groups;
}

function setInitialCandidatesReady(state: FilteringState) {
  state.initialCandidatesReady = true;
}

function setFilteredRecords(state: FilteringState, groups: KeyedRecordGroup[]) {
  state.filteredRecords = groups;
}

export class FilteringStateModule implements Module<FilteringState, any> {

  namespaced: boolean = true

  state: FilteringState

  actions = <ActionTree<FilteringState, any>> {
    // addCandidates
  }

  mutations = <MutationTree<FilteringState>> {
    // addCandidateGroup, clearCandidateGroups,
    setCurrentSelections, setFilteredRecords,
    setInitialCandidatesReady
  }

  getters = <GetterTree<FilteringState, any>> {
    // all
  }

  plugins: Plugin<FilteringState>[] = []

  constructor(plugins?: Plugin<FilteringState>[]) {
    this.state = new FilteringState();
    this.plugins = plugins ? plugins : [];
  }
}
