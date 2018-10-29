
import Vue from 'vue';

import Vuex, {
  // ActionContext,
  Store
} from "vuex"

import { getStoreBuilder } from "vuex-typex"

import { FilterEngineState } from "./components/filter-engine/filter-engine-state";

Vue.use(Vuex);


export interface RootState {
  filterEngine: FilterEngineState
}


const store: Store<RootState> = getStoreBuilder<RootState>().vuexStore();
export default store;

