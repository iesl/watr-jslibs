
import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';

Vue.use(VueRouter);
Vue.use(Vuex);

// 1. Define route components.
// These can be imported from other files
const Foo = { template: '<div>foo</div>' };
const Bar = { template: '<div>bar</div>' };

const routes = [
  { path: '/foo', component: Foo },
  { path: '/bar', component: Bar }
];

const router = new VueRouter({routes});

import App from './app/App';

import FilterWidget from './components/filter-engine/filter-engine.vue';

// import { SelectionFilteringEngine } from './lib/FilterEngine';


// import * from './components/filter-engine/filter-engine-state';
const app = new Vue({
  router,
  components: {
    App,
    FilterWidget,
  },
}).$mount('#app')
