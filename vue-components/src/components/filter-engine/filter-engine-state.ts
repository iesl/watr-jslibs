
import {
  SelectionFilteringEngine,
  KeyedRecords,
  CandidateGroup
} from './FilterEngine';

import { Module, GetterTree, MutationTree, ActionTree, Plugin } from 'vuex'

// Alt version
export class FilteringState {
  // queryString: string = "";
  candidateGroups: CandidateGroup[] = [];
  selectedGroups: KeyedRecords[] = [];
  filteringEngine: SelectionFilteringEngine = new SelectionFilteringEngine([]);
}

export function all(state: FilteringState): FilteringState {
  return state;
}
export function selectedGroups(state: FilteringState): KeyedRecords[] {
  return state.selectedGroups;
}

/**
 * Mutations
 */
function addCandidateGroup(state: FilteringState, group: CandidateGroup) {
  state.candidateGroups.push(group);
}
function clearCandidateGroups(state: FilteringState) {
  state.candidateGroups = [];
}

function setSelectedGroups(state: FilteringState, groups: KeyedRecords[]) {
  state.selectedGroups = groups;
}

export class FilteringStateModule implements Module<FilteringState, any> {

  namespaced: boolean = true

  state: FilteringState

  actions = <ActionTree<FilteringState, any>> {
  }

  mutations = <MutationTree<FilteringState>> {
    addCandidateGroup, clearCandidateGroups, setSelectedGroups
  }

  getters = <GetterTree<FilteringState, any>> {
    all
  }

  plugins: Plugin<FilteringState>[] = []

  // create everything
  constructor(plugins?: Plugin<FilteringState>[]) {
    this.state = new FilteringState();
    this.plugins = plugins ? plugins : [];
  }
}




















// export interface FilterEngineState {
//   queryString: string;
//   candidateGroups: CandidateGroup[];
//   selectedGroups: KeyedRecords[];
//   filteringEngine: SelectionFilteringEngine;
// }
//
// const initFilterEngineState: FilterEngineState = {
//   queryString: "",
//   candidateGroups: [],
//   selectedGroups: [],
//   filteringEngine: new SelectionFilteringEngine([])
// }
//
// const st = getStoreBuilder<RootState>().module("filterEngine", initFilterEngineState);
//
// function addCandidateGroup_(state: FilterEngineState, group: CandidateGroup) {
//   console.log('addCandidateGroup_', group);
//   state.candidateGroups.push(group);
// }
// function clearCandidateGroups_(state: FilterEngineState) {
//   state.candidateGroups = [];
// }
//
// function setSelectedGroups_(state: FilterEngineState, groups: KeyedRecords[]) {
//   state.selectedGroups = groups;
// }
//
//
// const stateGetter = st.state();
//
// const getters = {
//
// };
//
// const mutations = {
//   addCandidateGroup: st.commit(addCandidateGroup_),
//   clearCandidateGroups: st.commit(clearCandidateGroups_),
//   setSelectedGroups: st.commit(setSelectedGroups_),
// };
//
// const actions = {
//
// };
//
// export default {
//
//   get state() { return stateGetter(); },
//
//   getters,
//   mutations,
//   actions
//
// }
//
