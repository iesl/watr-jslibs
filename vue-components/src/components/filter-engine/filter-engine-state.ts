
import {
  SelectionFilteringEngine,
  KeyedRecordGroup,
  CandidateGroup
} from './FilterEngine';

import { Module, GetterTree, MutationTree, ActionTree, Plugin } from 'vuex'

export class FilteringState {
  allCandidateGroups: CandidateGroup[] = [];
  currentSelections: KeyedRecordGroup[] = [];
  filteredRecords: KeyedRecordGroup[] = [];
  filteringEngine: SelectionFilteringEngine = new SelectionFilteringEngine([]);
}

export function all(state: FilteringState): FilteringState {
  return state;
}

export function currentSelections(state: FilteringState): KeyedRecordGroup[] {
  return state.currentSelections;
}

function addCandidateGroup(state: FilteringState, group: CandidateGroup) {
  state.allCandidateGroups.push(group);
}

function clearCandidateGroups(state: FilteringState) {
  state.allCandidateGroups = [];
}

function setCurrentSelections(state: FilteringState, groups: KeyedRecordGroup[]) {
  state.currentSelections = groups;
}

function setFilteredRecords(state: FilteringState, groups: KeyedRecordGroup[]) {
  state.filteredRecords = groups;
}

export class FilteringStateModule implements Module<FilteringState, any> {

  namespaced: boolean = true

  state: FilteringState

  actions = <ActionTree<FilteringState, any>> {
  }

  mutations = <MutationTree<FilteringState>> {
    addCandidateGroup, clearCandidateGroups, setCurrentSelections, setFilteredRecords
  }

  getters = <GetterTree<FilteringState, any>> {
    all
  }

  plugins: Plugin<FilteringState>[] = []

  constructor(plugins?: Plugin<FilteringState>[]) {
    this.state = new FilteringState();
    this.plugins = plugins ? plugins : [];
  }
}
