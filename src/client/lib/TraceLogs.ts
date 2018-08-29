//


import * as _ from "lodash";
import * as d3 from "d3";
import * as lunr from "lunr";
import {t, htm} from "./jstags";
import * as rx from "rxjs";
import * as rxop from "rxjs/operators";

export class TraceLogs {
    public selectedTraceLogs = new rx.Subject<object[]>();
    public clearLogs = new rx.Subject<number>();

    private lunrIndex: lunr.Index;
    private tracelogs: object;
    private uniqLogTitles: string[];


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
            rxop.scan(count => count + 1, 0)
        );

        const traceControls = t.div([
            t.span([filterMenu, clearButton]),
            t.div(".thinborder", [
                t.div("Query Terms"),
                t.div("#trace-menu-terms", [
                    self.makeInlineList(self.indexTokens)
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
            const textVal = $("#trace-filter").val();
            $("#trace-menu-terms").empty();
            $("#trace-menu-hits").empty();

            if (textVal.length > 0) {
                const hitData = self.searchLogs(textVal) ;
                const hitTerms = self.matchDataToIndexTerms(hitData) ;
                const hitTermUL = self.makeInlineList(hitTerms);

                $("#trace-menu-terms").append(hitTermUL);

                hitLogs = self.getHitTracelogs(hitData);
                const allLogEntries = _.map(hitLogs, a => formatLogEntry(a));
                const uniqLogEntries = _.uniq(allLogEntries);
                const hitEntries = self.makeUL(uniqLogEntries);

                $("#trace-menu-hits").append(hitEntries);

                const otherTerms = _.filter(self.indexTokens, tok => {
                    return hitTerms.find(a => a === tok) === undefined;
                });
                const others = t.div([
                    self.makeInlineList(otherTerms)
                ]);

                $("#trace-menu-terms").append(others);

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

    public searchLogs(queryStr: string): lunr.MatchData[] {
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

    public getHitTracelogs(hits: lunr.MatchData[]): object[] {
        const self = this;
        const hitIndexes = _.map(hits, h => parseInt(h.ref, 10));
        const hitLogs = _.map(hitIndexes, i => {
            return self.tracelogs[i];
        });

        const sortedLogs = _.sortBy(hitLogs, log => log.entry.GeometryTraceLog.timestamp)
        return sortedLogs;
    }

    private initIndex(tracelogs: object): lunr.Index {

        const lunrIndex = lunr(function() {
            const idx = this;
            idx.field("tags");

            const pipeline = idx.pipeline;
            pipeline.reset();
            // const fs = pipeline.registeredFunctions;
            // let num = 0;
            const taggedTraces = _.each(tracelogs, (tracelog, lognum) => {
                let {entry, page} = tracelog;
                entry = entry.GeometryTraceLog;
                const tags = `p${page + 1}. ${entry.tags.toLowerCase()} ${entry.callSite.toLowerCase()}`;
                idx.add({
                    tags,
                    id: lognum
                });
                // num = lognum;
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

    private matchDataToIndexTerms(matchData: lunr.MatchData[]): string[] {
        const metadata = _.flatMap(matchData, match => {
            return _.keys(match.matchData.metadata);
        });

        return _.uniq(metadata);
    }

}

function formatLogEntry(tracelog): string {
    const { page } = tracelog;
    const entry = tracelog.entry.GeometryTraceLog;
    const { callSite } = entry;
    const n = `p${page+1} ${callSite} ${entry.tags}`;
    return n;
}


//
export function displayRx(widget: TraceLogs) {
    const hoverState = t.div("Clear Logs: ", [
        t.span("#ClearLogs").text("??")
    ]);
    const hoverGlyphState = t.div("Select Logs: ", [
        t.div("#SelectedLogs .scrollable-pane")
    ]);
    const node =
        t.div([
            hoverState,
            hoverGlyphState
        ]);

    widget.clearLogs.subscribe((i: number) => {
        const txt = `cleared ${i+1} times`;

        $("#ClearLogs").text(txt);
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
