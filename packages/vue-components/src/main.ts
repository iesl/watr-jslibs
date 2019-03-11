import Vue, {VNode, CreateElement} from "vue";

import Vuex from "vuex";
import VueRouter from "vue-router";
import "@/plugins/vuetify";
import installVueGlobals from "@/plugins/globals";

import App from "./app/App.vue";
import Browse from "./pages/browse/browse.vue";


Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(installVueGlobals, {endpoint: 'http://localhost:9000'});

const routes = [
  {path: "/", component: Browse},
  // {path: "/document", component: Foo},
  // {path: "/login", component: Foo},
  // {path: "/curate", component: Foo},
];

const router = new VueRouter({
  routes,
});

const app = new Vue({
  router,
  components: {
    App,
  },
  render(h: CreateElement): VNode {
    return h("App");
  },
});

app.$mount("#app");
