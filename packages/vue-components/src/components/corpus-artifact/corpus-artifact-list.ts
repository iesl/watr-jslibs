//
import _ from "lodash";

import {
  Vue,
  Component,
} from "vue-property-decorator";

import CorpusArtifact, {
  // @ts-ignore: Module '"*.vue"' has no exported member ...
  LoadingComponent, ErrorComponent,
} from "./corpus-artifact.vue";


@Component({
  components: {
    CorpusArtifact,
  }
})
export default class CorpusArtifactList extends Vue {

  corpusEntries: object[] = [];
  start: number = 20;
  last: number = 20;
  corpusSize: number = 340;

  mounted() {

    this.$getJson('/api/corpus/entries?start=0&len=10')
      .then((jsval: any) => {
        const corpusEntries = jsval.corpusEntries;
        const start = jsval.offset;
        this.start = start;
        this.last = start + corpusEntries.length - 1;
        _.each(corpusEntries, (e, i) => {
          e.index = i + start;
        });

        this.corpusEntries = corpusEntries;
      })
      .catch((err: any) => {
        console.log('error!: ', err);
      });

  }

}
