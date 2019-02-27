
/* tslint:disable: no-console */

import * as _ from "lodash";

import { SelectionFilteringEngine, CandidateGroup } from './FilterEngine';

import 'chai/register-should';

import { candidateGroupF, candidateGroup } from './dev-helpers';

function createFilter(cgs: CandidateGroup[]) {
  return new SelectionFilteringEngine(cgs);
}

describe('Selection Narrowing/Filtering',  () => {
  // const self = this;
  // console.log('this', self.ctx);

  const cs1 = candidateGroup('foo', 'alex');
  const cs2 = candidateGroup('bar', 'blob');
  // const cs3 = candidateGroup("foo", "alex");


  const g1 = candidateGroupF('foo', 'alex', g => ({ multikey: ['foo', g.page.toString()], displayTitle: '??' }));
  const g2 = candidateGroupF('foo', 'greg', g => ({ multikey: ['foo', g.page.toString()], displayTitle: '??' }));
  const g3 = candidateGroupF('bar', 'greg', g => ({ multikey: ['bar', g.page.toString()], displayTitle: '??' }));

  // const g2 = candidateGroupF("foo", "greg", (g) => ["foo", g.page.toString()]);
  // const g3 = candidateGroupF("bar", "greg", (g) => ["bar", g.page.toString()]);

  it('raw search should return correct # of results', () => {
    const filterEngine = createFilter([cs1, cs2]);

    filterEngine.search('al').length.should.equal(3);
    filterEngine.search('ex #2').length.should.equal(1);
    filterEngine.search('2').length.should.equal(2);
    filterEngine.search('l').length.should.equal(6);
  });

  it('groups entries together based on group key function', () => {
    createFilter([g1, g2, g3]).query('2').length
      .should.equal(2);

    createFilter([g1, g2]).query('2').length
      .should.equal(1);
  });

  it('reports the unique (grouped) entry names', () => {
    const groupNames = _.map(createFilter([g1, g2, g3]).query('2'), g => g.keystr);
    groupNames.should.eql(['bar 2', 'foo 2']);
  });

  it('reports the unique (grouped) entry names', () => {
    const groupNames = _.map(createFilter([g1, g2]).query('2'), g => g.keystr);
    groupNames.should.deep.equal(['foo 2']);
  });

  it('reports the available query terms, both hit and miss', () => {
    // const filterEngine = createFilter([g1, g2, g3]);
    // const r = filterEngine.query("2");
    // console.log(pp(r));
    //
  });

  it('properly parses queries, strips whitespace', () => {
    // TODO empty query should not return results.
    //
  });
});
