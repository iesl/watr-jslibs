// import FilterWidget from "./components/filter-engine/filter-engine";

// import {
//   FilterEngineState
// } from './filter-engine/filter-engine-state';

// import {
//   // Candidate,
//   CandidateGroup,
//   CandidateGroups,
//   KeyedRecord,
//   KeyedRecordGroup,
//   SelectionFilteringEngine
// } from './filter-engine/FilterEngine';

// const components = {
//   FilterWidget
//   // FilterEngineState
// };

// export interface Candidate;
// export interface CandidateGroup;
// export interface CandidateGroups;
// export interface KeyedRecord;
// export interface KeyedRecordGroup;
// export interface FilterEngineState;

// export default components;

export {
  default as FilterWidget,
} from "./src/components/filter-engine/filter-engine.vue";

export {
  SelectionFilteringEngine,
} from "./src/components/filter-engine/FilterEngine";

export * from "./src/components/filter-engine/filter-engine-state";
