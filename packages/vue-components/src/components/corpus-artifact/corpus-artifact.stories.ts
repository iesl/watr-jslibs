import {storiesOf} from "@storybook/vue";

import {
  LoadingComponent,
  ErrorComponent,
  default as CorpusArtifact
} from "./corpus-artifact.vue";

import {
  default as CorpusArtifactDev
} from "./corpus-artifact.dev.vue";

import {
  Vue,
  Component,
  Prop
} from "vue-property-decorator";

import { asyncGetJson } from '@/lib/dev-helpers'

import store from "@/store";

const stories = storiesOf("Corpus Artifacts", module);

const finalAsyncComp = asyncGetJson('http://localhost:3100/corpus-artifacts.json')
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

const asyncLoadingComponent = Vue.component('async-fetch', () => ({
  component: finalAsyncComp,
  loading: LoadingComponent,
  error: ErrorComponent,
  delay: 0, // Delay before showing the loading component. Default: 200ms.
  timeout: 30000 // Timeout before displaying error component
}));

stories.add("dev", () => ({
  store,
  template: '<CorpusArtifactDev />',
  data: () => {
    return {
      artifacts: []
    }
  },
  components: {CorpusArtifactDev},
}));

stories.add("single", () => ({
  store,
  template: '<async-fetch />',
  data: () => {
    return {
      artifacts: []
    }
  },
  components: {asyncLoadingComponent},
}));

stories.add("multi", () => ({
  store,
  template: '<async-fetch />',
  data: () => {
    return {
      artifacts: []
    }
  },
  components: {asyncLoadingComponent},
}));

// stories.add("paginated", () => ({}));
// stories.add("filtered by ???", () => ({}));
// stories.add("artifact only", () => ({}));



// const templateOne = `<CorpusArtifact v-bind="a"/>`;
// const templateMany = `<div v-for="a in artifacts" > <CorpusArtifact v-bind="a"/> </div>`;
// const template = `<div> ${templateMany} </div>`;
