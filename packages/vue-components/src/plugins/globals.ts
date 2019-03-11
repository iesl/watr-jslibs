
import Vue, { PluginObject } from "vue";

import { asyncGetJson } from '@/lib/dev-helpers';


const installVueGlobals: PluginObject<any> = {

  install: (vue, {endpoint}) => {
    vue.prototype.$serverRestEndpoint = endpoint;

    function getJson<T>(loc: string): Promise<T> {
      const _endpoint = endpoint;
      return asyncGetJson<T>(`${endpoint}${loc}`);
    };

    Vue.prototype.$getJson = getJson;
  }

};


export default installVueGlobals;


