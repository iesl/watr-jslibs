import Vue from 'vue'
import { Component } from "nuxt-property-decorator";

import TextGraphList from "./text-graph-list";

@Component({
  components: {TextGraphList},
})
export default class TextGraphDev extends Vue {
  // @Prop(Array) initialCandidateGroups!: CandidateGroup[];
}
