/**
 *
 */

import * as _ from "lodash";
import * as lunr from "lunr";
import {t, htm} from "./jstags";
import * as rx from "rxjs";
import * as rxop from "rxjs/operators";


/**
 * Selection filtering/narrowing engine
 */

interface ILTBoundsIntRep {
    left: number;
    top: number;
    width: number;
    height: number;
}


export class SelectionFilteringEngine {

    private lunrIndex: lunr.Index;

    // given a source list of candidates..
    // and a way to display them to the user, including grouping some candidates
    // allow incremental search over candidates, narrowing down
    // return final list of selected candidates, with grouping

    constructor() {
        this.lunrIndex = this.initIndex();
        // this.indexTokens = this.lunrIndex.tokenSet.toArray();
        // const allLogEntries = _.map(tracelogs, a => formatLogEntry(a));
        // this.uniqLogTitles = _.uniq(allLogEntries);
    }

    public addCandidates(candidates: object[]): void {
        const idx = this.lunrIndex;
        _.each(candidates, (candidate, lognum) => {
            const tags = formatLogEntry(candidate);
            idx.add({
                tags,
                id: lognum
            });
        });
    }

    private formatLogEntry(tracelog): string {
        let entry = "";

        switch (tracelog.logType) {
            case "Geometry" :
                const { page, headers: { timestamp, tags, callSite, name } } = tracelog;

                entry = `p${page+1}. ${callSite} ${tags}`;

                break;
        }


        return entry;
    }

    private initIndex(): lunr.Index {
        return lunr(function() {
            const idx = this;
            idx.field("tags");
            idx.pipeline.reset();
        });
    }


}

// TODO update lunr types file to most recent lunr version

export class SelectionFilter {

    public selectedTraceLogs = new rx.Subject<object[]>();
    public clearLogs = new rx.Subject<number>();

    private lunrIndex: lunr.Index;
    private tracelogs: object;
    private uniqLogTitles: string[];
    private indexTokens: any;

    constructor(tracelogs: object) {
        this.tracelogs = tracelogs;
        this.lunrIndex = this.initIndex(tracelogs);
        this.indexTokens = this.lunrIndex.tokenSet.toArray();

        const allLogEntries = _.map(tracelogs, a => formatLogEntry(a));
        this.uniqLogTitles = _.uniq(allLogEntries);
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
                        self.makeInlineList(self.indexTokens)
                    ])
                ])
            ]),
            t.div(".thinborder", [
                t.div("Trace Logs"),
                t.div("#trace-menu-hits", [
                    self.makeUL(self.uniqLogTitles)
                ])
            ])
        ]);

        let hitLogs: object[] = [];

        function filterFunc() {
            const inputVal = $("#trace-filter").val() as string;
            const value = inputVal ? inputVal : "";
            $("#trace-menu-terms-hit").empty();
            $("#trace-menu-terms-other").empty();
            $("#trace-menu-hits").empty();

            if (value.length > 0) {
                const hitData = self.searchLogs(value) ;
                const hitTerms = self.matchDataToIndexTerms(hitData) ;
                const hitTermUL = self.makeInlineList(hitTerms);
                const otherTerms = _.filter(self.indexTokens, tok => {
                    return hitTerms.find(a => a === tok) === undefined;
                });
                const others = self.makeInlineList(otherTerms);

                $("#trace-menu-terms-hit").append(hitTermUL);
                $("#trace-menu-terms-other").append(others);

                hitLogs = self.getHitTracelogs(hitData);
                const allLogEntries = _.map(hitLogs, a => formatLogEntry(a));
                const uniqLogEntries = _.uniq(allLogEntries);
                const hitEntries = self.makeUL(uniqLogEntries);
                // console.log('hit entry', hitData);

                $("#trace-menu-hits").append(hitEntries);


            } else {
                const hitTerms = self.makeInlineList(self.indexTokens);
                hitLogs = [];

                $("#trace-menu-terms").append(hitTerms);

                const hitEntries = self.makeUL(self.uniqLogTitles);
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

    public searchLogs(queryStr: string): lunr.Index.Result[] {
        const hits = this.lunrIndex.query((query) => {
            const terms = _.filter(_.split(queryStr, / +/), a => a.length > 0);
            _.each(terms, queryTerm => {
                query.clause({
                    term: `*${queryTerm}*`,
                    presence: lunr.Query.presence.REQUIRED
                });
            });

        });

        return hits;
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

    private initIndex(tracelogs: object): lunr.Index {

        const lunrIndex = lunr(function() {
            const idx = this;
            idx.field("tags");

            const pipeline = idx.pipeline;
            pipeline.reset();

            _.each(tracelogs, (tracelog, lognum) => {
                const tags = formatLogEntry(tracelog);
                idx.add({
                    tags,
                    id: lognum
                });
            });

        });

        return lunrIndex;
    }


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

    private matchDataToIndexTerms(matchData: lunr.Index.Result[]): string[] {
        const metadata = _.flatMap(matchData, match => {
            return _.keys(match.matchData.metadata);
        });

        return _.uniq(metadata);
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

export function displayRx(widget: SelectionFilter) {

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
