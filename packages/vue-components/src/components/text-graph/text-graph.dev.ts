import {Vue, Component} from "vue-property-decorator";

import TextGraph from "./text-graph.vue";

@Component({
  components: {TextGraph},
})
export default class TextGraphDev extends Vue {
  // @Prop(Array) initialCandidateGroups!: CandidateGroup[];
}
