
import _ from 'lodash';

import {
  Ref,
  ref,
  computed,
  watch,
  isRef,
} from '@vue/composition-api';

type ComponentName = string;
type ComponentInitRec = [ComponentName, boolean];

export interface ComponentState {
  setReady(name: string): void;
  // register(name: string): void;
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

function checkReactivity(a: Array<Ref<and>>, msg:string): void {
  const depsAreRefs = _.every(a, dep => isRef(dep));

  if (!depsAreRefs) {
    throw new Error(`Non-reactive member: ${msg}`);
  }
}
export function waitFor(
  name: string,
  { state, dependsOn, ensureTruthy }: WaitForOptions,
  userFunc: () => void
) {
  checkReactivity(dependsOn, `${name}:dependsOn`);
  checkReactivity(ensureTruthy, `${name}:ensureTruthy`);

  let didRun = false;

  const readyToGo = computed(() => {
    const isReady = state.isReady.value;
    const upstreamsReady = _.every(dependsOn, dep => dep.value);
    console.log(`${name} recomputing readyToGo!`);
    const ready = isReady && !didRun && upstreamsReady;
    if (ready) {
      didRun = true;
    }
    return ready;
  });

  watch(readyToGo, (ready) => {
    if (!ready) return;

    console.log(`${name} is ready and upstreams are satisfied!`);


    userFunc();

    watch(() => {
      const b = _.every(ensureTruthy, dep => dep.value);
      if (!b) return;

      console.log(`${name} downstreams are satisfied!`);

      if (!state.isRegistered(name)) {
        // state.register(name);
        state.setReady(name);
      }
    });

  });

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

  function setReady(name: string) {
    if (isRegistered(name)) {
      throw new Error(`setReady() on already registered component ${name}`);
    }
    const vs = componentList.value;
    vs.push([name, true]);
    componentList.value = vs;
  }

  // function register(name: string): void {
  //   if (isRegistered(name)) {
  //     throw new Error(`Already registered component ${name}`);
  //   }
  //   const vs = componentList.value;
  //   vs.push([name, false]);

  //   componentList.value = vs;
  // }

  // function setReady(name: string) {
  //   if (!isRegistered(name)) {
  //     throw new Error(`setReady() on unregistered component ${name}`);
  //   }
  //   const vs = componentList.value;
  //   const vindex = _.findIndex(vs, c => c[0] === name);
  //   vs.splice(vindex, 1, [name, true]);
  //   componentList.value = vs;
  // }

  function currentState() {
    return componentList.value;
  }

  const st = {
    // register,
    isRegistered,
    setReady,
    isReady,
    currentState
  }

  return st;
}
