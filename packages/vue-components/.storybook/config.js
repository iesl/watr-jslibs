/* eslint-disable import/no-extraneous-dependencies */
import { addParameters, configure } from '@storybook/vue';
import '@storybook/addon-console';

import Vue from 'vue';
import Vuex from 'vuex';
import installVueGlobals from "@/plugins/globals";

import router from "@/routes";

import "@/plugins/vuetify";

import AuthPlugin from "@/plugins/auth";
Vue.use(AuthPlugin);

Vue.use(Vuex);
Vue.use(installVueGlobals, {endpoint: 'http://localhost:9000'});


const req = require.context('../src', true, /(?!(.*flycheck.*))(\.stories\.ts$)/);
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
