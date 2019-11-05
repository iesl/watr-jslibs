
import Vue, { PluginObject } from "vue";

import { asyncGetJson } from '../lib/dev-helpers';
// import { ServerAPI } from '@/lib/ServerAPI';


const installVueGlobals: PluginObject<any> = {

  install: (vue, { endpoint, serverApi }) => {
    vue.prototype.$serverRestEndpoint = endpoint;
    vue.prototype.$serverApi = serverApi;

    function getJson<T>(loc: string): Promise<T> {
      // const _endpoint = endpoint;
      return asyncGetJson<T>(`${endpoint}${loc}`);
    };

    Vue.prototype.$getJson = getJson;
  }

};


export default installVueGlobals;


