/**
 * Selection filtering/narrowing engine
 *
 *   given a source list of candidates..
 *   and a way to display them to the user, including grouping some candidates
 *   allow incremental search over candidates, narrowing down
 *   return final list of selected candidates, with grouping
 *
 */

import * as _ from "lodash";
import * as lunr from "lunr";

type Candidate = object;


export interface CandidateGroup {
    name: string;
    candidates: Candidate[];
    keyFunc(c: Candidate): string;
}

export interface ResultGroup {
    name: string;
    candidates: Candidate[];
    matchTerms: string[];
}

export interface Results {
    groups: ResultGroup[];
}

interface IndexedHitResult {
    candidate: Candidate;
    groupNum: number;
    logNum: number;
}

export class SelectionFilteringEngine {

    private lunrIndex: lunr.Index;
    private candidateSets: CandidateGroup[];
    private indexTokens: string[];


    constructor(candidateSets: CandidateGroup[]) {
        this.candidateSets = candidateSets;
        this.lunrIndex = this.initIndex(candidateSets);
        this.indexTokens = this.lunrIndex.tokenSet.toArray();
        // const allLogEntries = _.map(tracelogs, a => formatLogEntry(a));
        // this.uniqLogTitles = _.uniq(allLogEntries);
    }


    public query(queryStr: string): Results {
        const searchResults = this.search(queryStr);
        const indexedResults = this.getIndexedResults(searchResults);

        const groupedResults = _.groupBy(indexedResults, (ir) => ir.groupNum);

        const groupedHits = _.map(_.keys(groupedResults), (groupNumStr) => {
            const groupNum = parseInt(groupNumStr, 10);
            const candidateGroup = this.candidateSets[groupNum];
            const resultGroup = groupedResults[groupNum];
            const candidates = _.map(resultGroup, (ir) => candidateGroup.candidates[ir.logNum]);

            const rg: ResultGroup = {
                name: candidateGroup.name,
                candidates,
                matchTerms: []
            };

            return rg;
        });

        const results: Results = {
            groups: groupedHits
        };

        return results;
    }

    public search(queryStr: string): lunr.Index.Result[] {
        const hits = this.lunrIndex.query((query) => {
            const terms = _.filter(_.split(queryStr, / +/), a => a.length > 0);
            _.each(terms, queryTerm => {
                const clause: lunr.Clause = {
                    term: `*${queryTerm}*`,
                    presence: lunr.Query.presence.REQUIRED
                };
                query.clause(clause);
            });

        });

        return hits;
    }


    private getIndexedResults(lunrResults: lunr.Index.Result[]): IndexedHitResult[] {
        const hits = _.map(lunrResults, h => {
            const [n1, n2] = h.ref.split(",");
            const r: IndexedHitResult = {
                groupNum: parseInt(n1, 10),
                logNum: parseInt(n2, 10),
                candidate: h
            };
            return r;
        });
        return hits;
    }

    // private getHitCandidates(hits: lunr.Index.Result[]): Candidate[] {
    //     const self = this;
    //     const hitIndexes = _.map(hits, h => {
    //         const [n1, n2] = h.ref.split(",");
    //         const l1 = parseInt(n1, 10);
    //         const l2 = parseInt(n2, 10);
    //         return [l1, l2];
    //     });

    //     const hitLogs = _.map(hitIndexes, ([setNum, logNum]) => {
    //         return self.candidateSets[setNum].candidates[logNum];
    //     });

    //     const sortedLogs = hitLogs; //  _.sortBy(hitLogs, log => log.headers.timestamp);
    //     return sortedLogs;
    // }


    private initIndex(candidateSets: CandidateGroup[]): lunr.Index {
        return lunr(function(this: lunr.Index) {
            const idx = this;
            idx.field("tags");
            idx.pipeline.reset();

            _.each(candidateSets, (candidateSet, setNum) => {
                // console.log('idx', idx);
                _.each(candidateSet.candidates, (candidate, logNum) => {
                    // const tags = this.formatLogEntry(candidate);
                    const tags = candidateSet.keyFunc(candidate);
                    idx.add({
                        tags,
                        id: [setNum, logNum]
                    });
                });
            });
        });
    }


}
