//
import 'chai/register-should';
import '~/plugins/composition-api';

import _ from 'lodash';

import {
  ref,
} from '@vue/composition-api';

import { initState, waitFor } from './component-basics';

describe('Component Basics',  () => {
  it('init state should properly track readiness', () => {

    // const a1 = [];
    // const every1 = _.every(a1, a => a === 0);
    // const some1 = _.some(a1, a => a === 0);
    // console.log('every1', every1);
    // console.log('some', some1);

    const state = initState();

    expect(state.isReady.value).toBe(true);

    state.register('comp-a');
    expect(state.isReady.value).toBe(false);

    state.setReady('comp-a');
    expect(state.isReady.value).toBe(true);

    state.register('comp-b');
    expect(state.isReady.value).toBe(false);
    state.register('comp-c');
    expect(state.isReady.value).toBe(false);

    state.setReady('comp-b');
    expect(state.isReady.value).toBe(false);
    state.setReady('comp-c');
    expect(state.isReady.value).toBe(true);

  });
  it('waitFor should ...  ', () => {
    const state = initState();
    expect(state.isReady.value).toBe(true);

    const dep1 = ref(false);
    const dep2 = ref(false);

    console.log('before one-comp');

    waitFor('one-comp', {
      state,
      dependsOn: [dep1],
      ensureTruthy: [dep2]
    }, () => {

      // expect(state.isReady.value).toBe(false);

      console.log('inside one-comp');
      dep2.value = true;

    });

    console.log('after one-comp');

    // expect(state.isReady.value).toBe(false);

    console.log('before two-comp');
    waitFor('two-comp', {
      state,
      dependsOn: [dep2],
      ensureTruthy: []
    }, () => {
      // expect(state.isReady.value).toBe(false);

      console.log('inside two-comp');

    });

    console.log('after two-comp');

    dep1.value = true;

    // expect(state.isReady.value).toBe(true);
  });
});
