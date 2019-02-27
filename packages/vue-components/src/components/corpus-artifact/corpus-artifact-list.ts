//
import {
  Vue,
  Component,
  Prop,
  Watch
} from "vue-property-decorator";

import CorpusArtifact, {
  // @ts-ignore: Module '"*.vue"' has no exported member ...
  LoadingComponent, ErrorComponent,
} from "./corpus-artifact.vue";

import { asyncGetJson } from '@/lib/dev-helpers'


@Component({
  components: {
    CorpusArtifact,
    // nav, listing
  }
})
export default class CorpusArtifactList extends Vue {

  corpusEntries: object[] = [];
  entryListingReady: boolean = false;

  @Watch('entryListingReady')
  populateListing() {

  }

  mounted() {
    // TODO Display a placeholder...

    const finalAsyncComp = () => asyncGetJson('http://localhost:3100/corpus-artifacts.json')
      .then( (jsval: any) => {
        const entry0 = () => jsval.corpusEntries[0]

        @Component({
          components: {CorpusArtifact},
          template: "<CorpusArtifact v-bind='data' />"
        }) class Thunk extends Vue {
          @Prop({default: entry0}) data!: any;
        }

        return Thunk;
      })
      .catch((err) => {
        console.log('error!: ', err);
      });

    // const asyncLoadingComponent = Vue.component('async-fetch', () => ({
    //   component: finalAsyncComp,
    //   loading: LoadingComponent,
    //   error: ErrorComponent,
    //   delay: 0, // Delay before showing the loading component. Default: 200ms.
    //   timeout: 30000 // Timeout before displaying error component
    // }));

  }

}
