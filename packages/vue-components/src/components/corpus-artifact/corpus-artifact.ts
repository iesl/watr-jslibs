/**
 *
 */

import * as _ from "lodash";

import {
  Vue,
  Component,
  Prop,
} from "vue-property-decorator";

@Component
export default class CorpusArtifact extends Vue {

  @Prop() index!: number;
  @Prop() entryName!: string;
  @Prop() stableId!: string;

  thumbnailUrl: string = `/api/v1/corpus/artifacts/entry/{{this.stableId}}/image/thumb/1`;
  docUrl = `/document/{{stableId}}?show=textgrid.json`;

}
