"use strict";
/**
 *
 */
exports.__esModule = true;
var _ = require("lodash");
var lunr = require("lunr");
var jstags_1 = require("./jstags");
var rx = require("rxjs");
var rxop = require("rxjs/operators");
var SelectionFilteringEngine = /** @class */ (function () {
    // given a source list of candidates..
    // and a way to display them to the user, including grouping some candidates
    // allow incremental search over candidates, narrowing down
    // return final list of selected candidates, with grouping
    function SelectionFilteringEngine() {
        this.lunrIndex = this.initIndex();
        // this.indexTokens = this.lunrIndex.tokenSet.toArray();
        // const allLogEntries = _.map(tracelogs, a => formatLogEntry(a));
        // this.uniqLogTitles = _.uniq(allLogEntries);
    }
    SelectionFilteringEngine.prototype.addCandidates = function (candidates) {
        var idx = this.lunrIndex;
        _.each(candidates, function (candidate, lognum) {
            var tags = formatLogEntry(candidate);
            idx.add({
                tags: tags,
                id: lognum
            });
        });
    };
    SelectionFilteringEngine.prototype.formatLogEntry = function (tracelog) {
        var entry = "";
        switch (tracelog.logType) {
            case "Geometry":
                var page = tracelog.page, _a = tracelog.headers, timestamp = _a.timestamp, tags = _a.tags, callSite = _a.callSite, name_1 = _a.name;
                entry = "p" + (page + 1) + ". " + callSite + " " + tags;
                break;
        }
        return entry;
    };
    SelectionFilteringEngine.prototype.initIndex = function () {
        return lunr(function () {
            var idx = this;
            idx.field("tags");
            idx.pipeline.reset();
        });
    };
    return SelectionFilteringEngine;
}());
exports.SelectionFilteringEngine = SelectionFilteringEngine;
// TODO update lunr types file to most recent lunr version
var SelectionFilter = /** @class */ (function () {
    function SelectionFilter(tracelogs) {
        this.selectedTraceLogs = new rx.Subject();
        this.clearLogs = new rx.Subject();
        this.tracelogs = tracelogs;
        this.lunrIndex = this.initIndex(tracelogs);
        this.indexTokens = this.lunrIndex.tokenSet.toArray();
        var allLogEntries = _.map(tracelogs, function (a) { return formatLogEntry(a); });
        this.uniqLogTitles = _.uniq(allLogEntries);
    }
    SelectionFilter.prototype.getNode = function () {
        var self = this;
        var filterMenu = jstags_1.htm.labeledTextInput("Filter", "trace-filter");
        var clearButton = jstags_1.t.button(".btn-lightlink", "Reset");
        self.clearLogs = rx.fromEvent(clearButton, "click").pipe(rxop.share(), rxop.scan(function (count) { return count + 1; }, 0));
        var traceControls = jstags_1.t.div([
            jstags_1.t.span([filterMenu, clearButton]),
            jstags_1.t.div(".thinborder", [
                jstags_1.t.div("Query Terms"),
                jstags_1.t.div("Hit: ", [
                    jstags_1.t.span("#trace-menu-terms-hit"),
                ]),
                jstags_1.t.div("Other: ", [
                    jstags_1.t.span("#trace-menu-terms-other", [
                        self.makeInlineList(self.indexTokens)
                    ])
                ])
            ]),
            jstags_1.t.div(".thinborder", [
                jstags_1.t.div("Trace Logs"),
                jstags_1.t.div("#trace-menu-hits", [
                    self.makeUL(self.uniqLogTitles)
                ])
            ])
        ]);
        var hitLogs = [];
        function filterFunc() {
            var inputVal = $("#trace-filter").val();
            var value = inputVal ? inputVal : "";
            $("#trace-menu-terms-hit").empty();
            $("#trace-menu-terms-other").empty();
            $("#trace-menu-hits").empty();
            if (value.length > 0) {
                var hitData = self.searchLogs(value);
                var hitTerms_1 = self.matchDataToIndexTerms(hitData);
                var hitTermUL = self.makeInlineList(hitTerms_1);
                var otherTerms = _.filter(self.indexTokens, function (tok) {
                    return hitTerms_1.find(function (a) { return a === tok; }) === undefined;
                });
                var others = self.makeInlineList(otherTerms);
                $("#trace-menu-terms-hit").append(hitTermUL);
                $("#trace-menu-terms-other").append(others);
                hitLogs = self.getHitTracelogs(hitData);
                var allLogEntries = _.map(hitLogs, function (a) { return formatLogEntry(a); });
                var uniqLogEntries = _.uniq(allLogEntries);
                var hitEntries = self.makeUL(uniqLogEntries);
                // console.log('hit entry', hitData);
                $("#trace-menu-hits").append(hitEntries);
            }
            else {
                var hitTerms = self.makeInlineList(self.indexTokens);
                hitLogs = [];
                $("#trace-menu-terms").append(hitTerms);
                var hitEntries = self.makeUL(self.uniqLogTitles);
                $("#trace-menu-hits").append(hitEntries);
            }
        }
        var debouncedFilter = _.debounce(filterFunc, 200);
        $(filterMenu).on("keypress", function (e) {
            if (e.keyCode === 13) {
                debouncedFilter.cancel();
                self.selectedTraceLogs.next(hitLogs);
                return false;
            }
            return true;
        });
        $(filterMenu).on("input", debouncedFilter);
        return traceControls;
    };
    SelectionFilter.prototype.searchLogs = function (queryStr) {
        var hits = this.lunrIndex.query(function (query) {
            var terms = _.filter(_.split(queryStr, / +/), function (a) { return a.length > 0; });
            _.each(terms, function (queryTerm) {
                query.clause({
                    term: "*" + queryTerm + "*",
                    presence: lunr.Query.presence.REQUIRED
                });
            });
        });
        return hits;
    };
    SelectionFilter.prototype.getHitTracelogs = function (hits) {
        var self = this;
        var hitIndexes = _.map(hits, function (h) { return parseInt(h.ref, 10); });
        var hitLogs = _.map(hitIndexes, function (i) {
            return self.tracelogs[i];
        });
        var sortedLogs = _.sortBy(hitLogs, function (log) { return log.headers.timestamp; });
        return sortedLogs;
    };
    SelectionFilter.prototype.initIndex = function (tracelogs) {
        var lunrIndex = lunr(function () {
            var idx = this;
            idx.field("tags");
            var pipeline = idx.pipeline;
            pipeline.reset();
            _.each(tracelogs, function (tracelog, lognum) {
                var tags = formatLogEntry(tracelog);
                idx.add({
                    tags: tags,
                    id: lognum
                });
            });
        });
        return lunrIndex;
    };
    SelectionFilter.prototype.makeUL = function (strs) {
        return jstags_1.t.ul([
            _.map(strs, function (st) { return jstags_1.t.li([st]); })
        ]);
    };
    SelectionFilter.prototype.makeInlineList = function (strs) {
        return jstags_1.t.ul(".inline-ul", [
            _.map(strs, function (st) { return jstags_1.t.li([
                jstags_1.t.span(".dimmed", [st])
            ]); })
        ]);
    };
    SelectionFilter.prototype.matchDataToIndexTerms = function (matchData) {
        var metadata = _.flatMap(matchData, function (match) {
            return _.keys(match.matchData.metadata);
        });
        return _.uniq(metadata);
    };
    return SelectionFilter;
}());
exports.SelectionFilter = SelectionFilter;
function formatLogEntry(tracelog) {
    var entry = "";
    switch (tracelog.logType) {
        case "Geometry":
            var page = tracelog.page, _a = tracelog.headers, timestamp = _a.timestamp, tags = _a.tags, callSite = _a.callSite, name_2 = _a.name;
            entry = "p" + (page + 1) + ". " + callSite + " " + tags;
            break;
    }
    return entry;
}
function displayRx(widget) {
    var node = jstags_1.t.div([
        jstags_1.t.div("Clear Logs: ", [
            jstags_1.t.span("#ClearLogs").text("??")
        ]),
        jstags_1.t.div("Select LogCount: ", [
            jstags_1.t.span("#SelectedLogCount").text("???")
        ]),
        jstags_1.t.div("Select Logs: ", [
            jstags_1.t.div("#SelectedLogs .scrollable-pane")
        ])
    ]);
    widget.clearLogs.subscribe(function (i) {
        var txt = "cleared " + i + " times";
        $("#ClearLogs").text(txt);
    });
    widget.selectedTraceLogs.subscribe(function (traceLogs) {
        $("#SelectedLogCount").text(traceLogs.length);
    });
    widget.selectedTraceLogs.subscribe(function (traceLogs) {
        var output = _.join(_.map(traceLogs, function (log) { return formatLogEntry(log); }), "\n");
        $("#SelectedLogs").empty();
        $("#SelectedLogs").append(jstags_1.t.pre(output));
    });
    return node;
}
exports.displayRx = displayRx;
