import {Vue, Component} from "vue-property-decorator";

import TextGraphList from "./text-graph-list.vue";

@Component({
  components: {TextGraphList},
})
export default class TextGraphDev extends Vue {
  // @Prop(Array) initialCandidateGroups!: CandidateGroup[];
}
