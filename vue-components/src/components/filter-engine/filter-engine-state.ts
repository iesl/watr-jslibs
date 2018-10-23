// import Vue from 'vue';
// import Vuex from 'vuex';

// import { ActionContext, Store } from "vuex"
import { getStoreBuilder } from "vuex-typex"
import { RootState } from "../../store";

export interface FilterEngineState {
  queryString: string;
}

const initFilterEngineState: FilterEngineState = {
  queryString: ""
}

const st = getStoreBuilder<RootState>().module("filterEngine", initFilterEngineState);

// state
const stateGetter = st.state();


export default {
  // state
  get state() { return stateGetter() },

  // // getters (wrapped as real getters)
  // get items() { return itemsGetter() },
  // get numberOfItems() { return numberOfItemsGetter() },

  // // mutations
  // commitAppendItem: b.commit(appendItem),
  // commitSetIsLoading: b.commit(setIsLoading),

  // // actions
  // dispatchRestoreSavedBasket: b.dispatch(restoreSavedBasket)
}
