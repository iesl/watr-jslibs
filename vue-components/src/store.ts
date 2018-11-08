import Vue from 'vue';
import Vuex from "vuex";

import { FilteringStateModule } from "./components/filter-engine/filter-engine-state";

Vue.use(Vuex);

export default new Vuex.Store({

  modules: {
    filteringState: new FilteringStateModule()
  }

});
