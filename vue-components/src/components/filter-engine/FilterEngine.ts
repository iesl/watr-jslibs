/**
 * Selection filtering/narrowing engine
 *
 *   given a source list of candidates..
 *   and a way to display them to the user, including grouping some candidates
 *   allow incremental search over candidates, narrowing down
 *   return final list of selected candidates, with grouping
 *
 */

mport _ from "lodash";
import lunr from "lunr";

type Candidate = object;

/**
 * User input into the selection engine:
 */
export interface CandidateGroup {
  candidates: Candidate[];
  groupKeyFunc(c: Candidate): GroupKey;
}

/**
 *
 */
export interface GroupKey {
  multikey: string[];
  displayTitle: string;
}

/**
 * Result of applying the groupKeyfunc to a candidate
 */
export interface KeyedRecord {
  candidate: Candidate;
  keys: string[];
  keystr: string;
  n: number;
}

export interface KeyedRecordGroup {
  records: KeyedRecord[];
  keystr: string;
}

export class SelectionFilteringEngine {
  public indexTokens: string[] = [];

  private lunrIndex: lunr.Index = this.initIndex([]);

  private keyedRecords: KeyedRecord[] = [];

  private keyedRecordGroups: KeyedRecordGroup[] = [];

  constructor(candidateSets: CandidateGroup[]) {
    this.setCandidateGroups(candidateSets);
  }

  public setCandidateGroups(candidateSets: CandidateGroup[]) {
    this.keyedRecords = this.regroupCandidates(candidateSets);
    this.keyedRecordGroups = this.groupRecordsByKey(this.keyedRecords);
    this.lunrIndex = this.initIndex(this.keyedRecords);
    this.indexTokens = this.lunrIndex.tokenSet.toArray();
  }

  public groupRecordsByKey(records: KeyedRecord[]): KeyedRecordGroup[] {
    const groups = _.groupBy(records, r => r.keystr);
    return _.map(
      _.toPairs(groups),
      ([keystr, recs]) =>
        ({
          keystr,
          records: _.sortBy(recs, r => r.n),
        } as KeyedRecordGroup),
    );
  }

  public getKeyedRecordGroups(): KeyedRecordGroup[] {
    return this.keyedRecordGroups;
  }

  public query(queryStr: string): KeyedRecordGroup[] {
    const searchResults = this.search(queryStr);
    const hitRecords = _.map(searchResults, h => {
      const id = parseInt(h.ref, 10);
      return this.keyedRecords[id];
    });

    return this.groupRecordsByKey(hitRecords);
  }

  public search(queryStr: string): lunr.Index.Result[] {
    const hits = this.lunrIndex.query(query => {
      const terms = _.filter(_.split(queryStr, / +/), a => a.length > 0);
      _.each(terms, queryTerm => {
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
    const grouped = _.flatMap(candidateSets, candidateSet =>
      _.map(candidateSet.candidates, candidate => {
        const groupKey = candidateSet.groupKeyFunc(candidate);
        const multikey = groupKey.multikey;
        const multikeystr = _.join(multikey, " ");
        const rec: KeyedRecord = {
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

  private initIndex(keyedRecords: KeyedRecord[]): lunr.Index {
    const lunrIndex = lunr(function(this: lunr.Index) {
      this.field("tags");
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
