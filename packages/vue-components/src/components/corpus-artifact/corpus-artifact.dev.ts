//

import {
  Vue,
  Component,
  Prop,
} from "vue-property-decorator";

import CorpusArtifact from "./corpus-artifact.vue";


@Component({
  components: {
    CorpusArtifact,
  }
})
export default class CorpusArtifactDev extends Vue {
  @Prop() story: string;

  get data(): any[] {

  }
}

