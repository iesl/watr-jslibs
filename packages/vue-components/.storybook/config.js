/* eslint-disable import/no-extraneous-dependencies */
import { configure } from '@storybook/vue';

import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

// const req = require.context('../src', true, /.stories.ts$/);
const req = require.context('../src', true, /(?!flycheck_)(\.stories\.ts$)/);
// test:

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
