
import Vue from 'vue';

import Vuex, {
  // ActionContext,
  // Store
} from "vuex";

// import { getStoreBuilder } from "vuex-typex"

import { FilteringStateModule, FilteringState } from "./components/filter-engine/filter-engine-state";

Vue.use(Vuex);

export default new Vuex.Store({

  modules: {
    filteringState: new FilteringStateModule()
  }

});


export interface RootState {
  filteringState: FilteringState
}


// const store: Store<RootState> = getStoreBuilder<RootState>().vuexStore();
// export default store;
