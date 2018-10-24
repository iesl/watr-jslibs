// import Vue from 'vue';
// import Vuex from 'vuex';

// import { ActionContext, Store } from "vuex"
import { getStoreBuilder } from "vuex-typex"
import { RootState } from "../../store";

import {
  KeyedRecord,
  KeyedRecords,
  CandidateGroup
} from './FilterEngine';


export interface FilterEngineState {
  queryString: string;

  candidates: Array<KeyedRecord>;
  candidateGroups: Array<CandidateGroup>;

  selectedGroups: Array<KeyedRecords>;
}

const initFilterEngineState: FilterEngineState = {
  queryString: "",
  candidates: [],
  candidateGroups: [],
  selectedGroups: [],
}

const st = getStoreBuilder<RootState>().module("filterEngine", initFilterEngineState);

// mutations
function setCandidates_(state: FilterEngineState, candidates: KeyedRecord[]) {
  state.candidates = candidates;
}

function addCandidateGroup_(state: FilterEngineState, group: CandidateGroup) {
  state.candidateGroups.push(group);
}
function clearCandidateGroups_(state: FilterEngineState) {
  state.candidateGroups = [];
}

function setSelectedGroups_(state: FilterEngineState, groups: KeyedRecords[]) {
  state.selectedGroups = groups;
}

const readCandidates_ = st.read(s => {
  return s.candidates;
}, "readCandidates");

const stateGetter = st.state();

const read = {
  get allCandidates() {
    return readCandidates_();
  },
};

const mod = {
  setCandidates: st.commit(setCandidates_),
  addCandidateGroup: st.commit(addCandidateGroup_),
  clearCandidateGroups: st.commit(clearCandidateGroups_),
  setSelectedGroups: st.commit(setSelectedGroups_),
};

const action = {

};

export default {

  get state() { return stateGetter(); },

  read,
  mod,
  action

}
