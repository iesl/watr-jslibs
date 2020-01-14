//
import _ from 'lodash';

import {
  Ref,
  // ref,
  // watch,
  // reactive,
  // toRefs,
} from '@vue/composition-api';
import { StateArgs } from './component-basics';

export interface Sketchpad {
  // mousePosRef: UnwrapRef<SketchpadPoint>;
  // loadShapes: (shapes: RTreeIndexable[]) => void;
  // eventRTree: RBush<RTreeIndexable>;
  // setMouseHandlers: (hs: MouseHandlerInit[]) => void;
}

type Args = StateArgs & {
  targetDivRef: Ref<HTMLDivElement|null>
};


export function useSketchpad({
  state,
  targetDivRef
}: Args): Sketchpad {


}
