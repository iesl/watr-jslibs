import * as $ from 'jquery';
import {storiesOf} from "@storybook/vue";

// import CorpusArtifactDev from "./corpus-artifact.dev.vue";
import CorpusArtifact from "./corpus-artifact.vue";

import store from "@/store";

const stories = storiesOf("Corpus Artifacts", module);

const template = `
<div>
    <div v-for="a in artifacts" >
        <CorpusArtifact v-bind="a"/>
    </div>
</div>
`;

function fetch(target: {artifacts: []}) {
  $.getJSON('http://localhost:3100/corpus-artifacts.json', (artifactJson: any) => {
    const artifacts = artifactJson.corpusEntries;
    target.artifacts = artifacts;
  }, (err) => {
    console.log('err', err);
  });

};

stories.add("single", () => ({
  store,
  template,
  data: () => {
    return {
      artifacts: []
    }
  },
  created() {
    fetch(this);
  },
  components: {CorpusArtifact}
}));

// stories.add("group", () => ({}));
// stories.add("paginated", () => ({}));
// stories.add("filtered by ???", () => ({}));
// stories.add("artifact only", () => ({}));
