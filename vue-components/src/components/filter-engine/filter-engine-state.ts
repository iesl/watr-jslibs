
import Vue from 'vue';

import {
  // SelectionFilteringEngine,
  KeyedRecordGroup,
  CandidateGroup
} from './FilterEngine';

import {
  Module,
  GetterTree,
  MutationTree,
  ActionTree,
  Action,
  ActionContext,
  // Commit,
  Plugin
} from 'vuex';

export interface FilteringState {
  allCandidateGroups: CandidateGroup[];
  currentSelections: KeyedRecordGroup[];
  filteredRecords: KeyedRecordGroup[];
  // $filteringEngine: SelectionFilteringEngine;
}
export function initFilteringState(): FilteringState {
  return <FilteringState> {
    allCandidateGroups: [],
    currentSelections: [],
    filteredRecords: [],
    // $filteringEngine: new SelectionFilteringEngine([])
  }
}

// export class FilteringState {
//   allCandidateGroups: CandidateGroup[] = [];
//   currentSelections: KeyedRecordGroup[] = [];
//   filteredRecords: KeyedRecordGroup[] = [];
//   filteringEngine: SelectionFilteringEngine = new SelectionFilteringEngine([]);
// }

const addCandidates: Action<FilteringState, any> = async function (context: ActionContext<FilteringState, any>, group: CandidateGroup) {
  const { commit } = context;
  commit('addCandidateGroup', group);
  // const { allCandidateGroups } = state;
  // console.log('action: addCandidates', allCandidateGroups, filteringEngine);
  // filteringEngine.setCandidateGroups(state.allCandidateGroups);
  // const recordGroups = filteringEngine.getKeyedRecordGroups();
  // commit('setCurrentSelections', recordGroups);
}

function addCandidateGroup(state: FilteringState, group: CandidateGroup) {
  console.log("state:addCandidateGroup", group);

  state.allCandidateGroups.push(group);
}

function clearCandidateGroups(state: FilteringState) {
  // state.allCandidateGroups = [];
  Vue.set(state, 'allCandidateGroups', []);
}

function setCurrentSelections(state: FilteringState, groups: KeyedRecordGroup[]) {
  console.log("state:setCurrentSelections");
  // state.currentSelections = groups;
  Vue.set(state, 'currentSelections', groups);
}

function setFilteredRecords(state: FilteringState, groups: KeyedRecordGroup[]) {
  // state.filteredRecords = groups;
  Vue.set(state, 'filteredRecords', groups);
}

export class FilteringStateModule implements Module<FilteringState, any> {

  namespaced: boolean = true

  state: FilteringState

  actions = <ActionTree<FilteringState, any>> {
    addCandidates
  }

  mutations = <MutationTree<FilteringState>> {
    addCandidateGroup, clearCandidateGroups, setCurrentSelections, setFilteredRecords
  }

  getters = <GetterTree<FilteringState, any>> {
    // all
  }

  plugins: Plugin<FilteringState>[] = []

  constructor(plugins?: Plugin<FilteringState>[]) {
    this.state = initFilteringState();
    this.plugins = plugins ? plugins : [];
  }
}
