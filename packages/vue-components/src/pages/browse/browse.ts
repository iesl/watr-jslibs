import {Vue, Component, Prop, Watch} from "vue-property-decorator";

import CorpusArtifact from "@/components/corpus-artifact/corpus-artifact.vue";

@Component({
  components: {
    CorpusArtifact,
  },
})
export default class Browse extends Vue {}
