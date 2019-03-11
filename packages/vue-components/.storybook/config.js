/* eslint-disable import/no-extraneous-dependencies */
import { addParameters, configure } from '@storybook/vue';
// import { themes } from '@storybook/theming';
import '@storybook/addon-console';

import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';
import installVueGlobals from "@/plugins/globals";

import "@/plugins/vuetify";

Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(installVueGlobals, {endpoint: 'http://localhost:3100'});


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
