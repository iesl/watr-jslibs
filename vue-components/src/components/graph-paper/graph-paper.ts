//
import {Vue, Component, Prop, Watch} from "vue-property-decorator";

@Component
export default class FilterWidget extends Vue {
  @Prop(Array) initialCandidateGroups!: CandidateGroup[];
}
