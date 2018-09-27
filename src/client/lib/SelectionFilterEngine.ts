/**
 *
 */

import * as _ from "lodash";
import * as lunr from "lunr";
// import * as rx from "rxjs";
// import * as rxop from "rxjs/operators";


/**
 * Selection filtering/narrowing engine
 */

interface IHeaders {
    timestamp: number;
    tags: string;
    callSite: string;
    name: string;
}

interface ICandidate {
    logType: string;
    page: number;
    headers: IHeaders;

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

    public addCandidates(candidates: ICandidate[]): void {
        const idx = this.lunrIndex;
        _.each(candidates, (candidate, lognum) => {
            const tags = this.formatLogEntry(candidate);
            idx.add({
                tags,
                id: lognum
            });
        });
    }

    private formatLogEntry(tracelog: ICandidate): string {
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
        return lunr(function(this: lunr.Index) {
            const idx = this;
            idx.field("tags");
            idx.pipeline.reset();
        });
    }


}

// TODO update lunr types file to most recent lunr version
