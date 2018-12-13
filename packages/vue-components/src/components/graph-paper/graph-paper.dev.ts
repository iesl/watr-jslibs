
// import {Vue, Component, Prop} from "vue-property-decorator";
import {Vue, Component} from "vue-property-decorator";

import GraphPaper from "./graph-paper.vue";

@Component({
  components: {GraphPaper},
})
export default class GraphPaperDev extends Vue {
  // @Prop(Array) initialCandidateGroups!: CandidateGroup[];
}
