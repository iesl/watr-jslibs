
import _ from 'lodash';

import {
  Ref,
  ref,
  watch,
  reactive,
  toRefs,
} from '@vue/composition-api';

type ComponentName = string;
type ComponentInitRec = [ComponentName, boolean];

export interface WaitForOptions {
  state: ComponentState;
  dependsOn?: Array<Ref<any>>;
  ensureTruthy?: Array<Ref<any>>;
}

/**
 * watch a ref for non-null/undefined values, then run callback
 */
export function watchFor<T>(tref: Ref<T | null | undefined>, fn: (t: T) => void) {
  watch(tref, (tval) => {
    if (!tval) return;
    fn(tval);
  });
}

/**
 * watch (once) a ref for non-null/undefined values, then run callback
 */
export function watchOnceFor<T>(tref: Ref<T | null | undefined>, fn: (t: T) => void) {
  const tv = tref.value;
  if (tv !== null && tv !== undefined) {
    // Check initial ref value, as the watch must be run lazily (skip initial check)
    //   to use the stop function
    fn(tv);
    return;
  }
  const stop = watch(tref, (tval) => {
    if (!tval) return;
    stop();
    fn(tval);
  }, { lazy: true });
}

/**
 * Create a watchable object that signals when all passed in
 * refs have a value !== null/undefined
 */
export function watchAll(rs?: Ref<any>[]) {
  if (!rs) return toRefs(reactive({
    done: true,
    len: 0,
    curr: 0
  }));

  const curr = rs;
  const next = ref(0);
  const state = toRefs(reactive({
    done: false,
    len: rs.length,
    curr: 0
  }));

  const stop = watch(next, () => {
    if (curr.length === 0) {
      state.done.value = true;
      stop();
      return;
    }

    const startFlag = ref(false);
    const rhead = curr.shift()!;

    const stopInner = watch([rhead, startFlag], () => {
      const rval = rhead.value;
      if (rval !== null && rval !== undefined) {
        stopInner();
        state.curr.value += 1;
        next.value += 1;
      }

    }, { lazy: true });

    startFlag.value = true;
  }, { lazy: true });

  next.value += 1;

  return state;
}

// TODO simplify the waitFor paradigm to something like the following:
// export function useSketchlibCore({ state, svgDrawTo, eventlibSelect }: Args)  {
//   waitFor(allInputArgs(), () => {
//     const pixiJsApp = pixiJsAppRef.value!;
//   });
//   return {};
// }

// TODO make a simplified version of this that auto-detects the caller's name, and
//   waits for completion of all function arguments
export function waitFor(
  name: string,
  { state, dependsOn, ensureTruthy }: WaitForOptions,
  userFunc: () => void
) {
  // state.register(name);

  const startFlag = ref(false);
  const upstreamsReady = ref(false);
  const userFuncRan = ref(false);

  // const prefix = `${name}::waitFor`;
  // console.log(`${prefix}/Setup`);

  const depsReady = watchAll(dependsOn);

  const stopPhase1 = watch([startFlag, depsReady.done], () => {
    // console.log(`${prefix}/Phase1: checkUpstream`);

    const ready = depsReady.done.value;

    if (ready) {
      stopPhase1();
      upstreamsReady.value = true;
    }
  }, { lazy: true, deep: true });


  const stopPhase2 = watch(upstreamsReady, (ready) => {
    if (ready) {
      stopPhase2();

      // console.log(`${prefix} upstreams are satisfied, running userFunc!`);

      userFunc();
      userFuncRan.value = true;
    }
  }, { lazy: true, deep: true });

  const downstreamWatcher = watchAll(ensureTruthy);

  const stopPhase3 = watch([userFuncRan, downstreamWatcher.done], () => {
    const ready = downstreamWatcher.done.value;

    if (ready) {
      stopPhase3();
      // console.log(`${prefix} downstreams are satisfied!`);
    }
  }, { lazy: true });

  // console.log(`${prefix}  GO!`);

  startFlag.value = true;
}

export interface ComponentState {
  // setReady(name: string): void;
  register(name: string): void;
  // isRegistered(name: string): boolean;
  // isReady: Ref<boolean>;
  // currentState(): [ComponentName, boolean][];
}

export type StateArgs = {
  state: ComponentState;
};

/**
 * Currently unused.
 * Implemented to track the init state of components, but I went with another
 * implementation. I'm leaving it here because I think it may be useful for other
 * things soon.
 */
export function initState(): ComponentState {
  const cs: ComponentInitRec[] = [];
  const componentList = ref(cs);

  function isRegistered(name: string): boolean {
    const vs = componentList.value;
    return _.some(vs, c => c[0] === name);
  }

  // const isReady: Readonly<Ref<Readonly<boolean>>> =
  //   computed(() => {
  //     const vs = componentList.value;
  //     return _.every(vs, c => c[1]);
  //   });

  // function setReady(name: string) {
  //   if (isRegistered(name)) {
  //     throw new Error(`setReady() on already registered component ${name}`);
  //   }
  //   const vs = componentList.value;
  //   vs.push([name, true]);
  //   componentList.value = vs;
  // }

  function register(name: string): void {
    if (isRegistered(name)) {
      throw new Error(`Already registered component ${name}`);
    }
    const vs = componentList.value;
    vs.push([name, false]);
    componentList.value = vs;
  }


  function currentState() {
    return componentList.value;
  }

  const st = {
    register,
    isRegistered,
    currentState,
  }

  return st;
}
