/**
 * Selection filtering/narrowing engine
 *
 *   given a source list of candidates..
 *   and a way to display them to the user, including grouping some candidates
 *   allow incremental search over candidates, narrowing down
 *   return final list of selected candidates, with grouping
 *
 */

import _ from "lodash";
import lunr from "lunr";

/**
 * User input into the selection engine:
 */
export interface CandidateGroup<T> {
  candidates: T[];
  groupKeyFunc(c: T): GroupKey;
}

/**
 *
 */
export interface GroupKey {
  multikey: string[];
}

/**
 * Result of applying the groupKeyfunc to a candidate
 */
export interface KeyedRecord<T> {
  candidate: T;
  keys: string[];
  keystr: string;
  n: number;
}

export interface KeyedRecordGroup<T> {
  records: KeyedRecord<T>[];
  keystr: string;
}


export class SelectionFilteringEngine<T> {
  public indexTokens: string[] = [];

  private lunrIndex: lunr.Index = this.initIndex([]);

  private keyedRecords: KeyedRecord<T>[] = [];

  private keyedRecordGroups: KeyedRecordGroup<T>[] = [];

  constructor(candidateGroups: CandidateGroup<T>[]) {
    this.setCandidateGroups(candidateGroups);
  }

  public setCandidateGroups(candidateGroups: CandidateGroup<T>[]) {
    this.keyedRecords = this.regroupCandidates(candidateGroups);
    this.keyedRecordGroups = this.groupRecordsByKey(this.keyedRecords);
    this.lunrIndex = this.initIndex(this.keyedRecords);
    const tokenSet = (<any>this.lunrIndex).tokenSet;
    this.indexTokens = tokenSet.toArray();
  }

  public groupRecordsByKey(records: KeyedRecord<T>[]): KeyedRecordGroup<T>[] {
    const groups = _.groupBy(records, r => r.keystr);
    const keyedGroups = _.map(
      _.toPairs(groups),
      ([keystr, recs]) =>
        ({
          keystr,
          records: _.sortBy(recs, r => r.n),
        } as KeyedRecordGroup<T>),
    );
    const sorted = _.sortBy(keyedGroups, k => k.keystr);
    return sorted;
  }


  public query(queryStr: string): KeyedRecordGroup<T>[] {
    if (queryStr.trim() === '') return this.keyedRecordGroups;
    const searchResults = this.lowlevelSearch(queryStr);
    const hitRecords = _.map(searchResults, h => {
      const id = parseInt(h.ref, 10);
      return this.keyedRecords[id];
    });

    return this.groupRecordsByKey(hitRecords);
  }

  lowlevelSearch(queryStr: string): lunr.Index.Result[] {
    const hits = this.lunrIndex.query(query => {
      const terms = _.filter(_.split(queryStr, / +/), a => a.length > 0);

      _.each(terms, queryTerm => {
        const clause: lunr.Query.Clause = {
          term: `*${queryTerm}*`,
          // @ts-ignore
          presence: 2, // = lunr.Query.presence.REQUIRED,
          usePipeline: false,
        };
        query.clause(clause);
      });

    });

    return hits;
  }

  private regroupCandidates(candidateGroups: CandidateGroup<T>[]): KeyedRecord<T>[] {
    const grouped = _.flatMap(candidateGroups, candidateGroup =>
      _.map(candidateGroup.candidates, candidate => {
        const groupKey = candidateGroup.groupKeyFunc(candidate);
        const multikey = groupKey.multikey;
        const multikeystr = _.join(multikey, " ");
        const rec: KeyedRecord<T> = {
          candidate,
          keys: multikey,
          keystr: multikeystr,
          n: 0,
        };
        return rec;
      }),
    );

    const groupSorted = _.sortBy(grouped, g => g.keys);
    _.each(groupSorted, (g, i) => (g.n = i));
    return groupSorted;
  }

  private initIndex(keyedRecords: KeyedRecord<T>[]): lunr.Index {
    const lunrIndex = lunr(function(this: lunr.Builder) {
      this.field("tags");
      this.field("id");

      this.pipeline.reset();

      _.each(keyedRecords, (rec, num) => {
        const keystr = rec.keystr;
        this.add({
          tags: keystr,
          id: num,
        });
      });
    });

    return lunrIndex;
  }
}
