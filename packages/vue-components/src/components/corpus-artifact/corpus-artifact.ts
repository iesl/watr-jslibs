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
  @Prop() entryName!: string;
  @Prop() stableId!: string;

  thumbnailUrl: string = `/api/v1/corpus/artifacts/entry/{{this.stableId}}/image/thumb/1`;
  docUrl = `/document/{{stableId}}?show=textgrid.json`;

}
