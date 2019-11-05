import Vue, {VNode, CreateElement} from "vue";

import Vuex from "vuex";
import "./plugins/vuetify";
import installVueGlobals from "./plugins/globals";

import AuthPlugin from "./plugins/auth";

import App from "./app/App.vue";
import { ServerAPI } from "./lib/ServerAPI";
import router from "./routes";

export class ProductionServerAPI implements ServerAPI {
  getCorpusListing(start: number, len: number): any[] {
    return [`TODO: ${start}, ${len}`];
  }

  constructor() {}
}

Vue.use(Vuex);
Vue.use(installVueGlobals, {
  endpoint: 'http://localhost:9000',
  serverApi: null
});

Vue.use(AuthPlugin);
Vue.config.productionTip = false;


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
