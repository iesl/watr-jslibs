import {Vue, Component, Prop, Watch} from "vue-property-decorator";

import {
  LoadingComponent,
  ErrorComponent,
  default as CorpusArtifact
} from '@/components/corpus-artifact/corpus-artifact.vue';


@Component({
  components: {
    CorpusArtifact,
  },
})
export default class Browse extends Vue {

  @Prop({default: ''}) restEndpoint!: string;
  // Pagination controls:
  page: number = 1;
  // artifactsWindow:
  // entries: any[]

  mounted() {
  }

}
