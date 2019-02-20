import Vue, {VNode, CreateElement} from "vue";

import Vuex from "vuex";
import VueRouter from "vue-router";

import App from "./app/App.vue";
import FilterWidget from "./components/filter-engine/filter-engine.vue";
import Browse from "./pages/browse/browse.vue";

Vue.use(VueRouter);
Vue.use(Vuex);

// 1. Define route components.
// These can be imported from other files
const Foo = {template: "<div> foo </div>"};
const Bar = {template: "<div>bar</div>"};

const routes = [
  {path: "/", component: Browse},
  {path: "/document", component: Foo},
  {path: "/login", component: Foo},
  {path: "/curate", component: Foo},
  {path: "/bar", component: Bar},
];

const router = new VueRouter({
  routes,
});

const app = new Vue({
  router,
  components: {
    App,
    FilterWidget,
  },
  render(h: CreateElement): VNode {
    return h("App");
  },
}).$mount("#app");

// From index.ts:
// export {
//   default as FilterWidget,
// } from './components/filter-engine/filter-engine.vue';

// export {
//   SelectionFilteringEngine,
// } from './lib/FilterEngine';

// export * from './components/filter-engine/filter-engine-state';
