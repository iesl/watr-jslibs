/**
 *
 */

import * as _ from "lodash";
import * as lunr from "lunr";
import {t, htm} from "./tstags";
import { SelectionFilteringEngine, CandidateGroup, Results } from "./SelectionFilteringEngine";
import * as rx from "rxjs";
import * as rxop from "rxjs/operators";


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

export class SelectionFilterWidget {

    public selectedTraceLogs = new rx.Subject<object[]>();
    public clearLogs = new rx.Subject<number>();

    // private lunrIndex: lunr.Index;
    // private tracelogs: object;
    // private uniqLogTitles: string[];
    private filteringEngine: SelectionFilteringEngine;
    // private candidateGroups: CandidateGroup[] = [];

    constructor(candidateGroups: CandidateGroup[]) {
        this.filteringEngine = new SelectionFilteringEngine(candidateGroups);
        // const candidateGroups = createCandidateGroup(
        //     tracelogs, (l) => ["trace", `p${l.page+1}. ${l.callSite} ${l.tags}`]
        // );

        // this.filteringEngine = createFilter(candidateGroups);

        // this.tracelogs = tracelogs;
        // this.lunrIndex = this.initIndex(tracelogs);
        // this.indexTokens = this.lunrIndex.tokenSet.toArray();

        // const allLogEntries = _.map(tracelogs, a => formatLogEntry(a));
        // this.uniqLogTitles = _.uniq(allLogEntries);
    }


    public getNode(): HTMLElement {
        const self = this;
        const filterMenu = htm.labeledTextInput("Filter", "trace-filter");
        const clearButton = t.button(".btn-lightlink", "Reset");

        self.clearLogs = rx.fromEvent(clearButton, "click").pipe(
            rxop.share(),
            rxop.scan(count => count + 1, 0)
        );


        const traceControls = t.div([
            t.span([filterMenu, clearButton]),
            t.div(".thinborder", [
                t.div("Query Terms"),
                t.div("Hit: ", [
                    t.span("#trace-menu-terms-hit"),
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
                    self.makeUL(self.filteringEngine.getCandidateList())
                ])
            ])
        ]);

        let hitLogs: ResultGroup = [];

        function filterFunc() {
            const inputVal = $("#trace-filter").val() as string;
            const value = inputVal ? inputVal : "";
            $("#trace-menu-terms-hit").empty();
            $("#trace-menu-terms-other").empty();
            $("#trace-menu-hits").empty();

            if (value.length > 0) {
                const results = self.searchLogs(value) ;
                // const hitData = self.searchLogs(value) ;
                const hitTerms = self.matchDataToIndexTerms(results) ;
                const hitTermUL = self.makeInlineList(hitTerms);
                const otherTerms = _.filter(self.filteringEngine.indexTokens, tok => {
                    return hitTerms.find(a => a === tok) === undefined;
                });
                const others = self.makeInlineList(otherTerms);

                $("#trace-menu-terms-hit").append(hitTermUL);
                $("#trace-menu-terms-other").append(others);

                hitLogs = results.groups; //  self.getHitTracelogs(hitData);
                const allLogEntries = _.map(hitLogs, a => a.keystr);
                const uniqLogEntries = _.uniq(allLogEntries);
                const hitEntries = self.makeUL(uniqLogEntries);
                // console.log('hit entry', hitData);

                $("#trace-menu-hits").append(hitEntries);


            } else {
                const hitTerms = self.makeInlineList(self.filteringEngine.indexTokens);
                hitLogs = [];

                $("#trace-menu-terms").append(hitTerms);

                const hitEntries = self.makeUL(self.filteringEngine.getCandidateList());
                $("#trace-menu-hits").append(hitEntries);

            }
        }

        const debouncedFilter = _.debounce(filterFunc, 200);

        $(filterMenu).on("keypress", (e) => {
            if (e.keyCode === 13) {
                debouncedFilter.cancel();
                self.selectedTraceLogs.next(hitLogs);
                return false;
            }
            return true;
        });

        $(filterMenu).on("input", debouncedFilter);

        return traceControls;
    }

    public searchLogs(queryStr: string): Results {
        const results = this.filteringEngine.query(queryStr);

        // const hits = this.lunrIndex.query((query) => {
        //     const terms = _.filter(_.split(queryStr, / +/), a => a.length > 0);
        //     _.each(terms, queryTerm => {
        //         query.clause({
        //             term: `*${queryTerm}*`,
        //             presence: lunr.Query.presence.REQUIRED
        //         });
        //     });

        // });

        return results;
    }

    public getHitTracelogs(hits: lunr.Index.Result[]): object[] {
        const self = this;
        const hitIndexes = _.map(hits, h => parseInt(h.ref, 10));
        const hitLogs = _.map(hitIndexes, i => {
            return self.tracelogs[i];
        });

        const sortedLogs = _.sortBy(hitLogs, log => log.headers.timestamp);
        return sortedLogs;
    }

    // private initIndex(tracelogs: object): lunr.Index {

    //     const lunrIndex = lunr(function() {
    //         const idx = this;
    //         idx.field("tags");

    //         const pipeline = idx.pipeline;
    //         pipeline.reset();

    //         _.each(tracelogs, (tracelog, lognum) => {
    //             const tags = formatLogEntry(tracelog);
    //             idx.add({
    //                 tags,
    //                 id: lognum
    //             });
    //         });

    //     });

    //     return lunrIndex;
    // }


    private makeUL(strs: string[]): HTMLUListElement {
        return t.ul([
            _.map(strs, st => t.li([st]))
        ]);
    }

    private makeInlineList(strs: string[]): HTMLUListElement {
        return t.ul(".inline-ul", [
            _.map(strs, st => t.li([
                t.span(".dimmed", [st])
            ]))
        ]);
    }

    private matchDataToIndexTerms(matchData: Results): string[] {
        // const metadata = _.flatMap(matchData, match => {
        //     return _.keys(match.matchData.metadata);
        // });

        // return _.uniq(metadata);
        return ["todo", "todo"];
    }

}

function formatLogEntry(tracelog): string {
    let entry = "";

    switch (tracelog.logType) {
        case "Geometry" :
            const { page, headers: { timestamp, tags, callSite, name } } = tracelog;

            entry = `p${page+1}. ${callSite} ${tags}`;

            break;
    }


    return entry;
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
        const output = _.join(_.map(traceLogs, log => formatLogEntry(log)), "\n");
        $("#SelectedLogs").empty();
        $("#SelectedLogs").append(
            t.pre(output)
        );
    });
    return node;

}
