
import Vue from "vue";

declare module "vue/types/vue" {
  interface Vue {
    $serverRestEndpoint: string;
    $getJson<T>(loc: string): Promise<T>;
    handleLoginEvent(data: any): void;
    handleLogoutEvent(data: any): void;
    $auth: any;
  }


  interface VueConstructor {
    $serverRestEndpoint: string;
    $getJson<T>(loc: string): Promise<T>;
    handleLoginEvent(): void;
  }
}
