// import Vue from 'vue';
// import Vuex from 'vuex';

// import { ActionContext, Store } from "vuex"
import { getStoreBuilder } from "vuex-typex"
import { RootState } from "../../store";

import {
  SelectionCandidate,
} from './FilterEngine';


export interface FilterEngineState {
  queryString: string;
  candidates: Array<SelectionCandidate>;
}

const initFilterEngineState: FilterEngineState = {
  queryString: "",
  candidates: [],
}

const st = getStoreBuilder<RootState>().module("filterEngine", initFilterEngineState);

// mutations
function setCandidates_(state: FilterEngineState, candidates: SelectionCandidate[]) {
  state.candidates = candidates;
}

const readCandidates_ = st.read(s => {
  return s.candidates;
}, "readCandidates");

const stateGetter = st.state();

export default {
  // state

  get state() { return stateGetter(); },


  // getters (wrapped as real getters)
  // get items() { return itemsGetter() },
  // get numberOfItems() { return numberOfItemsGetter() },

  mod: {
    setCandidates: st.commit(setCandidates_),
  },


  read: {
    get allCandidates() {
      return readCandidates_();
    },
  }

  // dispatchRestoreSavedBasket: b.dispatch(restoreSavedBasket)
}
