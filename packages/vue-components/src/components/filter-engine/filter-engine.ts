/**
 *
 */

import _ from "lodash";

import {Vue, Component, Prop, Watch} from "vue-property-decorator";

import {namespace} from "vuex-class";

import {
  SelectionFilteringEngine,
  CandidateGroup,
  KeyedRecordGroup,
} from "./FilterEngine";

const filterState = namespace("filteringState");

@Component
export default class FilterWidget extends Vue {
  @Prop(Array) initialCandidateGroups!: CandidateGroup[];

  queryString: string = "";

  @filterState.State currentSelections!: KeyedRecordGroup[];
  @filterState.State filteredRecords!: KeyedRecordGroup[];
  @filterState.State initialCandidatesReady!: Boolean;

  @filterState.Mutation("setFilteredRecords") setFilteredRecords!: (
    recs: KeyedRecordGroup[],
  ) => void;
  @filterState.Mutation("setCurrentSelections") setCurrentSelections!: (
    recs: KeyedRecordGroup[],
  ) => void;

  private engine = new SelectionFilteringEngine([]);

  query(): void {}

  filterReset(): void {
    this.setFilteredRecords([]);
  }

  filterUpdated(): void {
    this.setFilteredRecords(this.currentSelections);
  }

  created() {
    const qfunc = () => {
      const filteringEngine = this.engine;
      const hitRecs = filteringEngine.query(this.queryString);
      this.setCurrentSelections(hitRecs);
    };

    const debouncedQfunc: (() => void) & _.Cancelable = _.debounce(qfunc, 350);
    this.query = debouncedQfunc;
  }

  @Watch("initialCandidatesReady")
  onInitialCandidatesReady() {
    const filteringEngine = this.engine;
    filteringEngine.setCandidateGroups(this.initialCandidateGroups);
    const recordGroups = filteringEngine.getKeyedRecordGroups();
    this.setCurrentSelections(recordGroups);
  }

  @Watch("queryString")
  onQueryString() {
    this.query();
  }

  // @Watch('currentSelections')
  // onCurrentSelections() {
  // }
}
