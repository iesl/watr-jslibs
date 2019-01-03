
import {storiesOf} from "@storybook/vue";

import CorpusArtifactDev from "./corpus-artifact.dev.vue";

import store from "@/store";

const stories = storiesOf("Corpus Artifacts", module);

stories.add("basic", () => ({
  store,
  components: {CorpusArtifactDev},
  template: "<CorpusArtifactDev />"
}));
