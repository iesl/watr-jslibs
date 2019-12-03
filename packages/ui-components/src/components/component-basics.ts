
import _ from 'lodash';

import {
  Ref,
  ref,
  computed,
  watch,
} from '@vue/composition-api';

type ComponentName = string;
type ComponentInitRec = [ComponentName, Ref<boolean>];

export interface ComponentState {
  setReady(name: string): void;
  register(name: string): void;
  isRegistered(name: string): boolean;
  isReady: Ref<boolean>;
  currentState(): [ComponentName, boolean][];
}

export type StateArgs = {
  state: ComponentState
};

export interface WaitForOptions {
  state: ComponentState;
  dependsOn?: Array<Ref<any>>;
  ensureTruthy?: Array<Ref<any>>;
};

export function waitFor(
  name: string,
  { state, dependsOn, ensureTruthy }: WaitForOptions,
  f: () => void
) {

  let didRun = ref(false);

  const readyToGo = computed(() => {
    const isReady = state.isReady.value;
    const didNotRun = !didRun.value;
    const upstreamsReady = _.every(dependsOn, dep => dep.value);
    return isReady && didNotRun && upstreamsReady;
  });

  // const stop = watch([state.isReady, didRun], () => {
  watch(readyToGo, (ready) => {
    if (!ready) return;

    // const notReady = !state.isReady.value;
    // const alreadyRan = didRun.value;
    // if (notReady || alreadyRan) return;

    if (!state.isRegistered(name)) {
      state.register(name);
    }

    console.log(`${name} is ready!`);

    watch(() => {
      const allTruthy = _.every(dependsOn, dep => dep.value);
      if (!allTruthy) return;

      console.log(`${name} upstreams are satisfied!`);

      f();

      didRun.value = true;

      watch(() => {
        const b = _.every(ensureTruthy, dep => dep.value);
        if (!b) return;

        console.log(`${name} downstreams are satisfied!`);

        state.setReady(name);
      });

    });
  });

  // watch(didRun, () => {
  //   stop();
  // });
}

export function initState(): ComponentState {
  const cs: ComponentInitRec[] = [];
  const componentList = ref(cs);

  function isRegistered(name: string): boolean {
    const vs = componentList.value;
    return _.some(vs, c => c[0] === name);
  }

  const isReady: Readonly<Ref<Readonly<boolean>>> =
    computed(() => {
      const vs = componentList.value;
      return _.every(vs, c => c[1]);
    });

  function register(name: string): void {
    if (isRegistered(name)) {
      throw new Error(`Already registered component ${name}`);
    }
    const vs = componentList.value;
    vs.push([name, false]);

    componentList.value = vs;
  }

  function setReady(name: string) {
    if (!isRegistered(name)) {
      throw new Error(`setReady() on unregistered component ${name}`);
    }
    const vs = componentList.value;
    const vindex = _.findIndex(vs, c => c[0] === name);
    vs.splice(vindex, 1, [name, true]);
    componentList.value = vs;
  }

  function currentState() {
    return componentList.value;
  }

  const st = {
    register,
    isRegistered,
    setReady,
    isReady,
    currentState
  }

  return st;
}
