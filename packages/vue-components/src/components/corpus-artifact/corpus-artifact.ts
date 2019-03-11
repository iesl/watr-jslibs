/**
 *
 */

import * as _ from "lodash";
import { CreateElement } from 'vue';

import {
  Vue,
  Component,
  Prop,
} from "vue-property-decorator";


@Component
export class LoadingComponent extends Vue {
  render(h: CreateElement) {
    return h(`div`, "Loading");
  }
}

@Component
export class ErrorComponent extends Vue {
  render(h: CreateElement) {
    return h(`div`, "Error");
  }
}

@Component
export default class CorpusArtifact extends Vue {

  @Prop() index!: number;
  @Prop() stableId!: string;

  thumbnailUrl: string = `/api/v1/corpus/artifacts/entry/${this.stableId}/image/thumb/1`;
  docUrl = `/document/${this.stableId}?show=textgrid.json`;

  entryName(): string {
    return this.stableId.replace(/\.pdf\.d/, '');
  }

}

/*

  <!-- <a :href="docUrl">
  <v-img
  :src="thumbnailUrl"
  max-height="250px"
  height="200"
  width="200"
  ></v-img>
  </a>
  -->
  */
