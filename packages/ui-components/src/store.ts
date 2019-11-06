import Vue from 'vue';
import Vuex from 'vuex';

// import { FilteringStateModule } from './components/filter-engine/filter-engine-state';
import { TextGraphStateModule } from './components/text-graph/text-graph';
// import { PdfPageStateModule } from './components/pdf-pages/pdf-page';

Vue.use(Vuex);

export default new Vuex.Store({

  modules: {
    // filteringState: new FilteringStateModule(),
    textGraphState: new TextGraphStateModule(),
    // pdfPageState: new PdfPageStateModule()
  }

});
