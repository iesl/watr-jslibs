/**
 * Create 'hover' events
 */
import _ from 'lodash';

import {
  watch,
  ref,
  Ref,
} from '@vue/composition-api';

import { useEventlibCore  } from '~/components/eventlib-core'
import { StateArgs, waitFor } from '~/components/component-basics'


import {
  coords,
} from "sharedLib";

import { RTreeIndexable } from '~/lib/TextGlyphDataTypes';

type Args = StateArgs & {
  targetDivRef: Ref<HTMLDivElement|null>
};

export function useEventlibHover({
  state,
  targetDivRef
}: Args) {
  const eventlibCore = useEventlibCore({ targetDivRef, state });
  const { eventRTree } = eventlibCore;

  waitFor('EventlibHover', {
    state,
    dependsOn: [targetDivRef]
  }, () => {
    // const targetDiv = targetDivRef.value;

  });

  const hovered: RTreeIndexable[] = [];
  const hoveringRef = ref(hovered);

  watch(() => {
    const pos = eventlibCore.mousePosRef!;

    const userPt = coords.mkPoint.fromXy(pos.x, pos.y);

    const queryWidth = 2;
    const queryBoxHeight = 2;
    const queryLeft = userPt.x - queryWidth;
    const queryTop = userPt.y - queryBoxHeight;
    const queryBox = coords.mk.fromLtwh(queryLeft, queryTop, queryWidth, queryBoxHeight);

    const hits: RTreeIndexable[] = eventRTree.search(queryBox);
    _.each(hits, h => {
      const hany: any = h;
      hany.id = 1;
    });

    hovered.splice(0, hovered.length, ...hits);
  });

  return {
    eventlibCore,
    hoveringRef,
  }
}
