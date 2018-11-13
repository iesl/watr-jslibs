
import Vue from 'vue';

import {
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

export class FilteringState {
  allCandidateGroups: CandidateGroup[] = [];
  currentSelections: KeyedRecordGroup[] = [];
  filteredRecords: KeyedRecordGroup[] = [];
}

const addCandidates: Action<FilteringState, any> = async function (ctx: ActionContext<FilteringState, any>, group: CandidateGroup) {
  ctx.commit('addCandidateGroup', group);
}

function addCandidateGroup(state: FilteringState, group: CandidateGroup) {
  console.log("state:addCandidateGroup", group);

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
    this.state = new FilteringState(); // initFilteringState();
    this.plugins = plugins ? plugins : [];
  }
}
