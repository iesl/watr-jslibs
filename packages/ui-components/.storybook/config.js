// import '@storybook/addon-console';
import '@storybook/addon-actions';
import Vuex from 'vuex';
// import installVueGlobals from "@/plugins/globals";
// import router from "@/routes";
// import "@/plugins/vuetify";
// import AuthPlugin from "@/plugins/auth";
// Vue.use(AuthPlugin);
// Vue.use(installVueGlobals, {endpoint: 'http://localhost:9000'});

import { addParameters, configure } from '@storybook/vue';
import '../assets/css/tailwind.css'



import Vue from 'vue';
Vue.use(Vuex);

// import List from '../components/list/List.vue';

// Vue.component('List', List);

const req = require.context('../components', true, /(?!(.*flycheck.*))(\.stories\.[tj]s$)/);
function loadStories() {
  req.keys().forEach(filename => {
    if (!filename.includes("flycheck_")) {
      // console.log(`loading: ${filename}`);
      req(filename);
    } else {
      console.log(`skipping: ${filename}`);
    }
  });
}

configure(loadStories, module);
