/* eslint-disable import/no-extraneous-dependencies */
import { configure } from '@storybook/vue';

import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';

import { GlobalProps } from '@/globals';
import { asyncGetJson } from '@/lib/dev-helpers';

import "../src/plugins/vuetify";

Vue.use(VueRouter);
Vue.use(Vuex);

Vue.prototype.$globalProps = {
  serverRestEndpoint = "http://localhost:3100";
};

const req = require.context('../src', true, /(?!(.*flycheck.*))(\.stories\.ts$)/);

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
