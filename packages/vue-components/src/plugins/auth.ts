
//
import Vue, { PluginObject, VueConstructor } from "vue";
import authService from "@/auth/authService";

const plugin: PluginObject<{}> = {
  install(vue: VueConstructor) {

    vue.prototype.$auth = authService;

    vue.mixin({
      created(this: Vue) {
        if (this.handleLoginEvent) {
          authService.addListener("loginEvent", this.handleLoginEvent);
        }
      },

      destroyed(this: Vue) {
        if (this.handleLoginEvent) {
          authService.removeListener("loginEvent", this.handleLoginEvent);
        }
      }
    });
  }
};

export default plugin;
