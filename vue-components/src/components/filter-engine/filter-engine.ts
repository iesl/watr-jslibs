/**
 *
 */

import * as _ from 'lodash';
import { SelectionFilteringEngine, CandidateGroup, KeyedRecords } from './FilterEngine';
import * as rx from "rxjs";
// import * as rxop from "rxjs/operators";
// import { Observable } from "rxjs";
import Vue, { VueConstructor } from 'vue';


function createFilter(cgs: CandidateGroup[]) {
  return new SelectionFilteringEngine(cgs);
}

export function makeGroup(rawCandidates: object[], f: (a: object) => string[]): CandidateGroup {
  const g: CandidateGroup = {
    candidates: rawCandidates,
    groupKeyFunc: f,
  };
  return g;
}



export function makeFilter(rawCandidates: object[], f: (a: object) => string[]): VueConstructor<Vue> {
  const g: CandidateGroup = {
    candidates: rawCandidates,
    groupKeyFunc: f,
  };

  const filteringEngine = createFilter([g]);

  const FW = Vue.extend({
    name: 'FilterWidget',
    props: {
    },
    created() {

    },
    mounted() {},
    updated() {},
    destroyed() {},
    data() {
      return {
      };
    },
  });

  return FW;
}

export default Vue.extend({
    name: 'FilterWidget',
    components: {},
});

// class SelectionFilterWidget extends Vue {

//     // public selectedTraceLogs = new rx.Subject<object[]>();
//     // public clearLogs = new rx.Subject<number>();
//     // public currentSelection = new rx.Subject<KeyedRecords[]>();

//     private filteringEngine: SelectionFilteringEngine = new SelectionFilteringEngine([]);

//     // constructor(candidateGroups: CandidateGroup[]) {
//     //     this.filteringEngine = new SelectionFilteringEngine(candidateGroups);
//     // }


//     // public getNode(): JQuery<HTMLElement> {
//     //     const self = this;
//     //     const filterMenu = htm.labeledTextInput("Filter", "trace-filter");
//     //     const clearButton = t.button(".btn-lightlink", "Reset");

//     //     rx.fromEvent(clearButton, "click").pipe(
//     //         rxop.scan<Event, number>(count => count + 1, 0),
//     //         rxop.multicast(self.clearLogs),
//     //         rxop.refCount()
//     //     );


//     //     const traceControls = t.div([
//     //         t.span([filterMenu, clearButton]),
//     //         t.div(".thinborder", [
//     //             t.div("Query Terms"),
//     //             t.div("Hit: ", [
//     //                 t.span("#trace-menu-terms-hit", [
//     //                 ]),
//     //             ]),
//     //             t.div("Other: ", [
//     //                 t.span("#trace-menu-terms-other", [
//     //                     self.makeInlineList(self.filteringEngine.indexTokens)
//     //                 ])
//     //             ])
//     //         ]),
//     //         t.div(".thinborder", [
//     //             t.div("Trace Logs"),
//     //             t.div("#trace-menu-hits", [
//     //                 self.makeUL(self.getCountedTitles())
//     //             ])
//     //         ])
//     //     ]);


//     //     /// New Style
//     //     const inputRx = rx.fromEvent($(filterMenu), "input").pipe(
//     //         rxop.debounceTime(250),
//     //         rxop.map(ev => {
//     //             console.log("NewStyle query", ev);

//     //             const query: string = ev.target.value;
//     //             let res: KeyedRecords[] = self.filteringEngine.getKeyedRecordGroups();
//     //             if (query.length > 0) {
//     //                 const results = self.searchLogs(query);
//     //                 // const hitData = self.searchLogs(value) ;
//     //                 // const hitTerms = self.matchDataToIndexTerms(results) ;
//     //                 // const hitTermUL = self.makeInlineList(hitTerms);
//     //                 // const otherTerms = _.filter(self.filteringEngine.indexTokens, tok => {
//     //                 //     return hitTerms.find(a => a === tok) === undefined;
//     //                 // });

//     //                 res = results;
//     //             } else {
//     //                 // const hitTerms = self.makeInlineList(self.filteringEngine.indexTokens);
//     //                 // hitLogs = [];
//     //                 // const hitEntries = self.makeUL(self.filteringEngine.getCountedCandidateTitles());
//     //             }

//     //             // console.log("results", res);

//     //             return res;
//     //         })
//     //     );


//     //     const keypressRx = rx.fromEvent(filterMenu, "keypress").pipe(
//     //         rxop.filter((ev: Event) => (ev as any).keyCode === 13)
//     //     );

//     //     // const merged = rxop.mergeAll([inputRx, keypressRx]).pipe(
//     //     //     // rxop.scan((acc, e) => )
//     //     // );

//     //     inputRx.subscribe((x) => {
//     //         self.updateUI(x);
//     //     });

//     //     return traceControls;
//     // }

//     public searchLogs(queryStr: string): KeyedRecords[] {
//         return this.filteringEngine.query(queryStr);
//     }

//     // private updateUI(records: KeyedRecords[]) {
//     //     $("#trace-menu-terms-hit").empty();
//     //     $("#trace-menu-terms-other").empty();
//     //     $("#trace-menu-hits").empty();

//     //     const hitEntries = this.makeUL(this.formatKeyedRecordGroups(records));
//     //     $("#trace-menu-hits").append(hitEntries);
//     // }

//     // private makeUL(strs: string[]): JQuery<HTMLElement> {
//     //     return t.ul([
//     //         _.map(strs, st => t.li([st]))
//     //     ]);
//     // }

//     // private makeInlineList(strs: string[]): JQuery<HTMLElement> {
//     //     return t.ul(".inline-ul", [
//     //         _.map(strs, st => t.li([
//     //             t.span(".dimmed", [st])
//     //         ]))
//     //     ]);
//     // }

//     private matchDataToIndexTerms(matchData: KeyedRecords[]): string[] {
//         return ["todo", "todo"];
//     }

//     private formatKeyedRecordGroups(recordGroups: KeyedRecords[]): string[] {
//         return _.map(recordGroups, (group: KeyedRecords) => {
//             return `${group.keystr} (${group.records.length})`;
//         });
//     }

//     private getCountedTitles(): string[] {
//         return this.formatKeyedRecordGroups(this.filteringEngine.getKeyedRecordGroups());
//     }

// }

// $.getJSON("/data/tracelog/2", (tracelogs: LogEntry[]) => {
