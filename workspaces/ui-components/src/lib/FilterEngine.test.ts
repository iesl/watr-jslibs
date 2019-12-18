/* tslint:disable: no-console */

import _ from "lodash";

import 'chai/register-should';
import { SelectionFilteringEngine, CandidateGroup, GroupKey } from './FilterEngine';
// import { prettyPrint } from './pretty-print';
import { ILogEntry } from './tracelogs';

console.log('starting import');
import tracelog from '~/../dev-data/tracelogs/tracelog.json';
console.log('ending import');

function createFilter(cgs: CandidateGroup<ILogEntry>[]) {
  return new SelectionFilteringEngine(cgs);
}

export function numberedCandidateGroup(
  name: string,
  tags: string,
  groupKeyFunc: (c: ILogEntry) => GroupKey,
  count: number
): CandidateGroup<ILogEntry> {
  const candidates: ILogEntry[] = _.map(
    _.range(0, count), (i: number) => ({
      page: i,
      logType: 'Geometry',
      headers: {
        tags: `${tags} #${i}`,
        name: `${name}${i+1}`,
        callSite: '',
        timestamp: 10
      },
      body: []
    })
  );

  const cset: CandidateGroup<ILogEntry> = {
    candidates,
    groupKeyFunc
  };

  return cset;
}

export function candidateGroupF(
  name: string,
  tags: string,
  groupKeyFunc: (c: ILogEntry) => GroupKey
): CandidateGroup<ILogEntry> {
  return numberedCandidateGroup(name, tags, groupKeyFunc, 3);
}

export function candidateGroup(
  name: string,
  tags: string
): CandidateGroup<ILogEntry> {
  return candidateGroupF(
    name, tags,
    (c: ILogEntry) => {
      const multikey = [name, `page=${c.page}`, `${c.headers.tags}`];
      return { multikey };
    }
  );
}

describe('Selection Narrowing/Filtering',  () => {

  const cs1 = candidateGroup('foo', 'alex');
  const cs2 = candidateGroup('bar', 'blob');


  const g1 = candidateGroupF('foo', 'fooGrpName', g => ({ multikey: ['foo', g.page.toString()+'.'] }));
  const g2 = candidateGroupF('bar', 'barGrpName', g => ({ multikey: ['bar', (g.page+20).toString()+'.'] }));
  const g3 = candidateGroupF('baz', 'bazGrpName', g => ({ multikey: ['baz', (g.page+30).toString()+'.'] }));


  it('raw search should return correct # of results', () => {
    const filterEngine = createFilter([cs1, cs2]);

    filterEngine.lowlevelSearch('al').length.should.equal(3);
    filterEngine.lowlevelSearch('ex #2').length.should.equal(1);
    filterEngine.lowlevelSearch('2').length.should.equal(2);
    filterEngine.lowlevelSearch('l').length.should.equal(6);
  });

  it('groups entries together based on group key function', () => {
    let res = createFilter([g1, g2, g3]).query('foo 2');
    res.length.should.equal(1);

    res = createFilter([g1, g2, g3]).query('ba 2');
    res.length.should.equal(4);

    res = createFilter([g1, g2, g3]).query('ba 2.');
    res.length.should.equal(2);
  });

  it('reports the unique (grouped) entry names', () => {
    const res = createFilter([g1, g2, g3]).query('ba 2.');
    const groupNames = _.map(res, g => g.keystr);
    groupNames.should.eql(['bar 22.', 'baz 32.']);
  });

  it.only('should test very large filter inputs (for profiling)', () => {
    // const grps = numberedCandidateGroup(
    //   'foo',
    //   'fooGrpName',
    //   g => ({ multikey: ['foo', g.page.toString()+'.'] }),
    //   100000
    // );

    console.log('starting test');
    const groups: CandidateGroup<ILogEntry> = {
      candidates: tracelog as ILogEntry[],
      groupKeyFunc: (l: ILogEntry) => ({
        multikey: ["trace", `p${l.page+1}. ${l.headers.callSite} ${l.headers.tags}`]
      })
    };
    console.log('finished creating candidates');

    _.each(_.range(100), (i) => {
      console.log('iter', i);
      new SelectionFilteringEngine([groups]);
    });

    console.log('done');
  });

});
