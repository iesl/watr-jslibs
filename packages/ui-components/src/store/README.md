# STORE

src/store.ts
// import Vue from 'vue';
// import Vuex from 'vuex';

// // import { FilteringStateModule } from './components/filter-engine/filter-engine-state';
// import { TextGraphStateModule } from './components/text-graph/text-graph';
// // import { PdfPageStateModule } from './components/pdf-pages/pdf-page';

// Vue.use(Vuex);

// export default new Vuex.Store({

//   modules: {
//     // filteringState: new FilteringStateModule(),
//     textGraphState: new TextGraphStateModule(),
//     // pdfPageState: new PdfPageStateModule()
//   }

// });


.storybook/store.js
import Vue from 'vue'
import Vuex from 'vuex'

import axios from 'axios'

import actions from '../src/store/actions'

let store = new Vuex.Store({
  actions: actions
})

 Bind Axios to Store as we don't have access to Nuxt's $axios instance here
store.$axios = axios

export default store
