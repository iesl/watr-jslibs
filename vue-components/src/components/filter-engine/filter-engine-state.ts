import { getStoreBuilder } from "vuex-typex"
import { RootState } from "../../store";

import {
  // KeyedRecord,
  SelectionFilteringEngine,
  KeyedRecords,
  CandidateGroup
} from './FilterEngine';


export interface FilterEngineState {
  queryString: string;
  candidateGroups: CandidateGroup[];
  selectedGroups: KeyedRecords[];
  filteringEngine: SelectionFilteringEngine;
}

const initFilterEngineState: FilterEngineState = {
  queryString: "",
  candidateGroups: [],
  selectedGroups: [],
  filteringEngine: new SelectionFilteringEngine([])
}

const st = getStoreBuilder<RootState>().module("filterEngine", initFilterEngineState);

// mutations
// function setCandidates_(state: FilterEngineState, candidates: KeyedRecord[]) {
//   state.candidates = candidates;
// }

function addCandidateGroup_(state: FilterEngineState, group: CandidateGroup) {
  // console.log('addCandidateGroup_', group);
  state.candidateGroups.push(group);
}
function clearCandidateGroups_(state: FilterEngineState) {
  state.candidateGroups = [];
}

function setSelectedGroups_(state: FilterEngineState, groups: KeyedRecords[]) {
  state.selectedGroups = groups;
}


const stateGetter = st.state();

const getters = {

};

const mutations = {
  addCandidateGroup: st.commit(addCandidateGroup_),
  clearCandidateGroups: st.commit(clearCandidateGroups_),
  setSelectedGroups: st.commit(setSelectedGroups_),
};

const actions = {

};

export default {

  get state() { return stateGetter(); },

  getters,
  mutations,
  actions

}
