declare module '*.vue' {
  import Vue from 'vue';

  export default Vue;
}

// declare module "vue/types/vue" {
//   import _Vue from 'vue';
//   interface Vue {
//     $serverRestEndpoint: string;
//     $getJson<T>(loc: string): Promise<T>;
//   }


//   interface VueConstructor {
//     $serverRestEndpoint: string;
//     $getJson<T>(loc: string): Promise<T>;
//   }
// }
