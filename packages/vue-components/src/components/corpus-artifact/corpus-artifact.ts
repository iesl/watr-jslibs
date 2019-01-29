/**
 *
 */

import * as _ from "lodash";

import {
  Vue,
  Component,
  Prop,
  // Watch
} from "vue-property-decorator";

// import {namespace} from "vuex-class";

// const filterState = namespace("filteringState");

@Component
export default class CorpusArtifact extends Vue {
  // @Prop(Array) initialCandidateGroups!: CandidateGroup[];

  @Prop() index!: number;
  @Prop() entryName!: string;
  @Prop() stableId!: string;

  thumbnailUrl: string = `/api/v1/corpus/artifacts/entry/{{  this.stableId  }}/image/thumb/1`;
  docUrl = `/document/{{stableId}}?show=textgrid.json`;

}
