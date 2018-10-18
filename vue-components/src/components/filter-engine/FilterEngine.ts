/**
 * Selection filtering/narrowing engine
 *
 *   given a source list of candidates..
 *   and a way to display them to the user, including grouping some candidates
 *   allow incremental search over candidates, narrowing down
 *   return final list of selected candidates, with grouping
 *
 */

import _ from 'lodash';
import lunr from 'lunr';
// import { pp } from "./utils";
// import { sortedUniqCountBy } from "./LodashPlus";

type Candidate = object;


export interface CandidateGroup {
    candidates: Candidate[];
    groupKeyFunc(c: Candidate): string[];
}


export interface KeyedRecord {
    candidate: Candidate;
    keys: string[];
    keystr: string;
    n: number;
}

export interface KeyedRecords {
    records: KeyedRecord[];
    keystr: string;
}

export interface ResultGroup {
    keyedRecords: KeyedRecord[];
    keystr: string;
}

export interface Results {
    groups: ResultGroup[];
}

export class SelectionFilteringEngine {
    public indexTokens: string[];
    private lunrIndex: lunr.Index;
    private keyedRecords: KeyedRecord[];
    private keyedRecordGroups: KeyedRecords[];


    constructor(candidateSets: CandidateGroup[]) {
      this.keyedRecords = this.regroupCandidates(candidateSets);
      this.keyedRecordGroups = this.groupRecordsByKey(this.keyedRecords);
      this.lunrIndex = this.initIndex(this.keyedRecords);
      this.indexTokens = this.lunrIndex.tokenSet.toArray();
      // this.debugOutputIndex();
    }

    public groupRecordsByKey(records: KeyedRecord[]): KeyedRecords[] {
      const groups = _.groupBy(records, r => r.keystr);
      return _.map(_.toPairs(groups), ([keystr, recs]) => ({
        records: _.sortBy(recs, r => r.n),
        keystr,
      } as KeyedRecords));
    }

    public getKeyedRecordGroups(): KeyedRecords[] {
      return this.keyedRecordGroups;
    }


    public query(queryStr: string): KeyedRecords[] {
      const searchResults = this.search(queryStr);
      const hitRecords = _.map(searchResults, (h) => {
        const id = parseInt(h.ref, 10);
        return this.keyedRecords[id];
      });

      return this.groupRecordsByKey(hitRecords);
    }

    public search(queryStr: string): lunr.Index.Result[] {
      const hits = this.lunrIndex.query((query) => {
        const terms = _.filter(_.split(queryStr, / +/), a => a.length > 0);
        _.each(terms, (queryTerm) => {
          const clause: lunr.Clause = {
            term: `*${queryTerm}*`,
            presence: lunr.Query.presence.REQUIRED,
          };
          query.clause(clause);
        });
      });

      return hits;
    }


    private regroupCandidates(candidateSets: CandidateGroup[]): KeyedRecord[] {
      const grouped = _.flatMap(candidateSets, candidateSet => _.map(candidateSet.candidates, (candidate) => {
        const keys = candidateSet.groupKeyFunc(candidate);
        const rec: KeyedRecord = {
          candidate,
          keys,
          keystr: _.join(keys, ' '),
          n: 0,
        };
        return rec;
      }));

      const groupSorted = _.sortBy(grouped, g => g.keys);
      _.each(groupSorted, (g, i) => g.n = i);
      return groupSorted;
    }

    private initIndex(keyedRecords: KeyedRecord[]): lunr.Index {
      const lunrIndex = lunr(function (this: lunr.Index) {
        const idx = this;
        idx.field('tags');
        idx.pipeline.reset();
        _.each(keyedRecords, (rec, num) => {
          const keystr = rec.keystr;
          idx.add({
            tags: keystr,
            id: num,
          });
        });
      });


      return lunrIndex;
    }

    // private debugOutputIndex(): void {
    //     /* tslint:disable: no-console */
    //     console.log("lunr Index");
    //     // console.log(pp(this.lunrIndex));
    //     console.log("lunr token set");
    //     // console.log(pp(this.indexTokens));
    // }
}

// public query2(queryStr: string): Results {
//     const searchResults = this.search(queryStr);
//     const hitRecords = _.map(searchResults, h => {
//         const id = parseInt(h.ref, 10);
//         return this.keyedRecords[id];
//     });

//     const groupedHits = _.groupBy(hitRecords, (rec) => {
//         return _.join(rec.keys, " ");
//     });

//     const groups = _.map(_.toPairs(groupedHits), ([keys, group]) => {
//         const rg: ResultGroup = {
//             keyedRecords: group,
//             keystr: keys // _.join(keys, "/")
//             // matchTerms: []
//         };
//         return rg;
//     });

//     const results: Results = {
//         groups
//     };

//     return results;
// }
