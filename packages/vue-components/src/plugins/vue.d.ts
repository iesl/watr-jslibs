

import * as vue from "vue";

declare module "vue" {
  interface Vue {
    $serverRestEndpoint: string;
    $getJson<T>(loc: string): Promise<T>;
  }


  interface VueConstructor {
    $serverRestEndpoint: string;
    $getJson<T>(loc: string): Promise<T>;
    // $globalProps: GlobalProps;
  }
}

// declare module "vue/types/options" {
//   interface ComponentOptions<V extends Vue> {
//     $globalProps: GlobalProps;
//   }
// }
