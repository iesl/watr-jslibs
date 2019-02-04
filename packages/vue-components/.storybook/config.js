/* eslint-disable import/no-extraneous-dependencies */
import { configure } from '@storybook/vue';

import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';

Vue.use(VueRouter);
Vue.use(Vuex);

// const req = require.context('../src', true, /.stories.ts$/);
const req = require.context('../src', true, /(?!(.*flycheck.*))(\.stories\.ts$)/);
// test:

function loadStories() {
  req.keys().forEach(filename => {
    if (!filename.includes("flycheck_")) {
      console.log(`loading: ${filename}`);
      req(filename);
    } else {
      console.log(`skipping: ${filename}`);
    }
  });
}

configure(loadStories, module);
