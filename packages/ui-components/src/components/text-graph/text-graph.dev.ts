import Vue from 'vue'
import Component from 'nuxt-class-component'

import TextGraphList from "./text-graph-list.vue";

@Component({
  components: {TextGraphList},
})
export default class TextGraphDev extends Vue {
  // @Prop(Array) initialCandidateGroups!: CandidateGroup[];
}
