import * as $ from 'jquery';
import {storiesOf} from "@storybook/vue";

import CorpusArtifact from "./corpus-artifact.vue";

import {
  Vue,
  Component,
  Prop
} from "vue-property-decorator";


import store from "@/store";

function asyncGetJson<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    $.getJSON(url, (response: any) => {
      console.log('getting', response);
      return resolve(response)
    }).fail((xhr, status, err) => reject(`Server Error (${status}): ${err}`));
  });
}

const stories = storiesOf("Corpus Artifacts", module);

@Component
class LoadingComponent extends Vue {
  render(h) {
    return h(`div`, "Loading");
  }
}
@Component
class ErrorComponent extends Vue {
  render(h) {
    return h(`div`, "Error");
  }
}

@Component
class FinalComponent extends Vue {
  public constructor() {
    super();

  }

  // render(h) {
  //   return h(`div`, "I am the final component!");
  // }
}


const finalAsyncComp = asyncGetJson('http://localhost:3100/corpus-artifacts.json')
  .then(jsval => {
    const entry0 = () => jsval.corpusEntries[0]
    const entry0x = jsval.corpusEntries[0]
    console.log('entry0', entry0x);

    @Component({
      components: {CorpusArtifact}
    }) class Thunk extends FinalComponent {
      @Prop({default: entry0}) data!: any;

      mounted() {
        
      }

      render(h) {
        return h(`CorpusArtifact`, {
          attrs: {
            'v-bind': 'this.data'
          }
        });
      }
    };

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

stories.add("single", () => ({
  store,
  template: '<span><async-fetch /></span>',
  data: () => {
    return {
      artifacts: []
    }
  },
  created() {
  },
  components: {CorpusArtifact, asyncLoadingComponent},
}));

// stories.add("group", () => ({}));
// stories.add("paginated", () => ({}));
// stories.add("filtered by ???", () => ({}));
// stories.add("artifact only", () => ({}));



// const templateOne = `<CorpusArtifact v-bind="a"/>`;
// const templateMany = `<div v-for="a in artifacts" > <CorpusArtifact v-bind="a"/> </div>`;
// const template = `<div> ${templateMany} </div>`;
