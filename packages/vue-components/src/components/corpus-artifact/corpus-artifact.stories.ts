import {storiesOf} from "@storybook/vue";

import {
  default as CorpusArtifactList
} from "./corpus-artifact-list.vue";

import store from "@/store";

const stories = storiesOf("Corpus Artifacts", module);

stories.add("paginated listing", () => ({
  store,
  template: '<v-app> <CorpusArtifactList /> </v-app>',
  data: () => {
    return {
      artifacts: []
    }
  },
  components: {CorpusArtifactList},
}));

// stories.add("filtered by ???", () => ({}));
// stories.add("artifact only", () => ({}));

