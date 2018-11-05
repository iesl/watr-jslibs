// import FilterWidget from "./components/filter-engine/filter-engine";

// import {
//   FilterEngineState
// } from './filter-engine/filter-engine-state';

// import {
//   // Candidate,
//   CandidateGroup,
//   CandidateGroups,
//   KeyedRecord,
//   KeyedRecords,
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
// export interface KeyedRecords;
// export interface FilterEngineState;

// export default components;

export {
  default as FilterWidget,
} from "./src/components/filter-engine/filter-engine";

export {
  SelectionFilteringEngine,
} from "./src/components/filter-engine/FilterEngine";

export * from "./src/components/filter-engine/filter-engine-state";
