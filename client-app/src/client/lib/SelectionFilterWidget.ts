/**
 *
 */

import * as _ from "lodash";
import { t, htm } from "./tstags";
import { vtags } from "./vtags";
import { SelectionFilteringEngine, CandidateGroup, KeyedRecords } from "./SelectionFilteringEngine";
import * as rx from "rxjs";
import * as rxop from "rxjs/operators";
import Vue from "vue";
import { CreateElement, VNode } from "vue";
import * as vuem from "vue";
// import { Observable } from "rxjs";


export function createFilter(cgs: CandidateGroup[]) {
    return new SelectionFilteringEngine(cgs);
}

export function createCandidateGroup(rawCandidates: object[], f: (a: object) => string[]): CandidateGroup {
    const g: CandidateGroup = {
        candidates: rawCandidates,
        groupKeyFunc: f
    };
    return g;
}

/* tslint:disable: object-literal-shorthand  */

export class SelectionFilterWidget {

    public selectedTraceLogs = new rx.Subject<object[]>();
    public clearLogs = new rx.Subject<number>();


    /// TESTING
    public currentSelection = new rx.Subject<KeyedRecords[]>();


    private filteringEngine: SelectionFilteringEngine;

    constructor(candidateGroups: CandidateGroup[]) {
        this.filteringEngine = new SelectionFilteringEngine(candidateGroups);

    }

    public getVueNode(): Vue {

        const self = this;

        // console.log('vuetmp', vuetmp);

        const vuex = new Vue({


            render: function create(): VNode {
                const vm = this;
                const v = vtags(this);
                const createElement = vm.$createElement;

                // const filterMenu = htm.labeledTextInput("Filter", "trace-filter");
                // const clearButton = t.button(".btn-lightlink", "Reset");
                const key = "trace-filter";
                const label = "Filter";

                const node = v.div([
                    v.span([
                        v.span([
                            v.input(":text", `@${key}`, `#${key}`),
                            v.label({for: `${key}`}, label)
                        ]),
                        // createElement("button")
                        v.button(".btn-lightlink",
                                 "Reset",
                                 { "v-on:click": "alert('hello')" })

                    ]),
                    v.div(".thinborder", [
                        v.div("Query Terms"),
                        v.div("Hit: ", [
                            v.span("#trace-menu-terms-hit", []),
                        ]),
                        v.div("Other: ", [
                            v.span("#trace-menu-terms-other", [
                                "message=" + vm.$data.message
                                // self.makeInlineList(self.filteringEngine.indexTokens)
                            ])
                        ])
                    ]),
                    v.div(".thinborder", [
                        v.div("Trace Logs"),
                        v.div("#trace-menu-hits", [
                            "message2=" + vm.$data.message2
                        ])
                    ])
                ]);

                return node;
            }
        });

        return vue;


    }


    public getNode(): JQuery<HTMLElement> {
        const self = this;
        const filterMenu = htm.labeledTextInput("Filter", "trace-filter");
        const clearButton = t.button(".btn-lightlink", "Reset");

        rx.fromEvent(clearButton, "click").pipe(
            rxop.scan<Event, number>(count => count + 1, 0),
            rxop.multicast(self.clearLogs),
            rxop.refCount()
        );


        const traceControls = t.div([
            t.span([filterMenu, clearButton]),
            t.div(".thinborder", [
                t.div("Query Terms"),
                t.div("Hit: ", [
                    t.span("#trace-menu-terms-hit", [
                    ]),
                ]),
                t.div("Other: ", [
                    t.span("#trace-menu-terms-other", [
                        self.makeInlineList(self.filteringEngine.indexTokens)
                    ])
                ])
            ]),
            t.div(".thinborder", [
                t.div("Trace Logs"),
                t.div("#trace-menu-hits", [
                    self.makeUL(self.getCountedTitles())
                ])
            ])
        ]);



        /// New Style
        const inputRx = rx.fromEvent($(filterMenu), "input").pipe(
            rxop.debounceTime(250),
            rxop.map(ev => {
                console.log("NewStyle query", ev);

                const query: string = ev.target.value;
                let res: KeyedRecords[] = self.filteringEngine.getKeyedRecordGroups();
                if (query.length > 0) {
                    const results = self.searchLogs(query);
                    // const hitData = self.searchLogs(value) ;
                    // const hitTerms = self.matchDataToIndexTerms(results) ;
                    // const hitTermUL = self.makeInlineList(hitTerms);
                    // const otherTerms = _.filter(self.filteringEngine.indexTokens, tok => {
                    //     return hitTerms.find(a => a === tok) === undefined;
                    // });

                    res = results;
                } else {
                    // const hitTerms = self.makeInlineList(self.filteringEngine.indexTokens);
                    // hitLogs = [];
                    // const hitEntries = self.makeUL(self.filteringEngine.getCountedCandidateTitles());
                }

                // console.log("results", res);

                return res;
            })
        );


        const keypressRx = rx.fromEvent(filterMenu, "keypress").pipe(
            rxop.filter((ev: Event) => (ev as any).keyCode === 13)
        );

        // const merged = rxop.mergeAll([inputRx, keypressRx]).pipe(
        //     // rxop.scan((acc, e) => )
        // );

        inputRx.subscribe((x) => {
            self.updateUI(x);
        });

        return traceControls;
    }

    public searchLogs(queryStr: string): KeyedRecords[] {
        return this.filteringEngine.query(queryStr);
    }

    private updateUI(records: KeyedRecords[]) {
        $("#trace-menu-terms-hit").empty();
        $("#trace-menu-terms-other").empty();
        $("#trace-menu-hits").empty();

        const hitEntries = this.makeUL(this.formatKeyedRecordGroups(records));
        $("#trace-menu-hits").append(hitEntries);
    }

    private makeUL(strs: string[]): JQuery<HTMLElement> {
        return t.ul([
            _.map(strs, st => t.li([st]))
        ]);
    }

    private makeInlineList(strs: string[]): JQuery<HTMLElement> {
        return t.ul(".inline-ul", [
            _.map(strs, st => t.li([
                t.span(".dimmed", [st])
            ]))
        ]);
    }

    private matchDataToIndexTerms(matchData: KeyedRecords[]): string[] {
        return ["todo", "todo"];
    }

    private formatKeyedRecordGroups(recordGroups: KeyedRecords[]): string[] {
        return _.map(recordGroups, (group: KeyedRecords) => {
            return `${group.keystr} (${group.records.length})`;
        });
    }

    private getCountedTitles(): string[] {
        return this.formatKeyedRecordGroups(this.filteringEngine.getKeyedRecordGroups());
    }

}


export function displayRx(widget: SelectionFilterWidget) {

    const node =
        t.div([
            t.div("Clear Logs: ", [
                t.span("#ClearLogs").text("??")
            ]),
            t.div("Select LogCount: ", [
                t.span("#SelectedLogCount").text("???")
            ]),
            t.div("Select Logs: ", [
                t.div("#SelectedLogs .scrollable-pane")
            ])
        ]);



    widget.clearLogs.subscribe((i: number) => {
        const txt = `cleared ${i} times`;

        $("#ClearLogs").text(txt);
    });

    widget.selectedTraceLogs.subscribe((traceLogs) => {
        $("#SelectedLogCount").text(traceLogs.length);
    });

    widget.selectedTraceLogs.subscribe((traceLogs) => {
        // const output = _.join(_.map(traceLogs, log => formatLogEntry(log)), "\n");
        // $("#SelectedLogs").empty();
        // $("#SelectedLogs").append(
        //     t.pre(output)
        // );
    });
    return node;

}


        // let hitLogs: KeyedRecords[] = [];

        // function filterFunc() {
        //     const inputVal = $("#trace-filter").val() as string;
        //     const value = inputVal ? inputVal : "";
        //     $("#trace-menu-terms-hit").empty();
        //     $("#trace-menu-terms-other").empty();
        //     $("#trace-menu-hits").empty();

        //     if (value.length > 0) {
        //         const results = self.searchLogs(value) ;
        //         // const hitData = self.searchLogs(value) ;
        //         const hitTerms = self.matchDataToIndexTerms(results) ;
        //         const hitTermUL = self.makeInlineList(hitTerms);
        //         const otherTerms = _.filter(self.filteringEngine.indexTokens, tok => {
        //             return hitTerms.find(a => a === tok) === undefined;
        //         });
        //         const others = self.makeInlineList(otherTerms);

        //         $("#trace-menu-terms-hit").append(hitTermUL);
        //         $("#trace-menu-terms-other").append(others);

        //         hitLogs = results; //  self.getHitTracelogs(hitData);
        //         const allLogEntries = _.map(hitLogs, a => a.keystr);
        //         const uniqLogEntries = _.uniq(allLogEntries);
        //         const hitEntries = self.makeUL(uniqLogEntries);
        //         // console.log('hit entry', hitData);

        //         $("#trace-menu-hits").append(hitEntries);


        //     } else {
        //         const hitTerms = self.makeInlineList(self.filteringEngine.indexTokens);
        //         hitLogs = [];

        //         $("#trace-menu-terms").append(hitTerms);

        //         const hitEntries = self.makeUL(self.getCountedTitles());
        //         $("#trace-menu-hits").append(hitEntries);

        //     }
        // }

        // const debouncedFilter = _.debounce(filterFunc, 200);

        // $(filterMenu).on("keypress", (e) => {
        //     if (e.keyCode === 13) {
        //         debouncedFilter.cancel();
        //         self.selectedTraceLogs.next(hitLogs);
        //         return false;
        //     }
        //     return true;
        // });

        // $(filterMenu).on("input", debouncedFilter);
