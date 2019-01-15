/**
 *
 */

import * as _ from "lodash";

import {
  Vue,
  Component,
  // Prop,
  // Watch
} from "vue-property-decorator";

// import {namespace} from "vuex-class";

// const filterState = namespace("filteringState");

@Component
export default class CorpusArtifact extends Vue {
  // @Prop(Array) initialCandidateGroups!: CandidateGroup[];

  num: number = 10;

  entryName: string = "name-todo";

  stableId: string = "11-00ABC.pdf";

  thumbnailUrl: string = `/api/v1/corpus/artifacts/entry/${this.stableId}/image/thumb/1`;
  docUrl = `/document/{{stableId}}?show=textgrid.json`;


}
