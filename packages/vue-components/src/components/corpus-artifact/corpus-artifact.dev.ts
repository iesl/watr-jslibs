//

import {
  Vue,
  Component,
  // Prop,
  // Watch
} from "vue-property-decorator";

import CorpusArtifact from "./corpus-artifact.vue";


@Component({
  components: {
    CorpusArtifact,
  }
})
export default class CorpusArtifactDev extends Vue {
  // @Prop(Array) initialCandidateGroups!: CandidateGroup[];

}