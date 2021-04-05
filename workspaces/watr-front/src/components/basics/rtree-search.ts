/**
 * Initialize and return an rtree interface
 */

import _ from 'lodash'

import {
  Ref,
  ref
} from '@vue/composition-api'

import { EventlibCore } from './eventlib-core'
import { StateArgs } from '~/components/basics/component-basics'
import * as coords from '~/lib/coord-sys'
import { EMouseEvent, MouseHandlerInit } from '~/lib/EventlibHandlers'
import { TranscriptIndex, TranscriptIndexable } from '~/lib/transcript/transcript-index'

interface Flashlight<T> {
  off(): void;
  litItemsRef: Ref<TranscriptIndexable<T>[]>;
}

// type FlashlightToggle<T> = (eventlibCore: EventlibCore) => Flashlight<T>;

// export interface RTreeIndex<T> {
//   loadData: LoadData<T>;
//   search: Search<T>;
//   flashlight: FlashlightToggle<T>;
// }

type Args = StateArgs & {
  indexKey: string;
  transcriptIndex: TranscriptIndex;
  eventlibCore: EventlibCore;
}

export function useFlashlight<T>({
  transcriptIndex,
  indexKey,
  eventlibCore
}: Args): Flashlight<T> {

  const litItemsRef: Ref<TranscriptIndexable<any>[]> = ref([])

  const rtree = transcriptIndex.indexes[indexKey];

  const mousemove = (e: EMouseEvent) => {
    const pos = e.pos
    const mousePt = coords.mkPoint.fromXy(pos.x, pos.y)
    const queryBox = coords.boxCenteredAt(mousePt, 8, 8)
    const hits = rtree.search(queryBox)
    litItemsRef.value = hits
  }

  const handlers: MouseHandlerInit = () => {
    return {
      mousemove
    }
  }

  eventlibCore.setMouseHandlers([handlers])

  const off = () => {
    // TODO unwatch(litItemsRef)
  }

  return {
    litItemsRef, off
  }
}
// const flashlight: Flashlight<T> = {

//   return {
//     flashlight
//   }
// }

// function useRTreeIndex<T>({}: Args): RTreeIndex<T> {
//   const rtree: RBush<T> = new RBush<T>()
//   const dataRef: Ref<T[] | null> = ref(null)

//   watch(dataRef, () => {
//     const data = dataRef.value
//     if (data) {
//       rtree.load(data)
//       dataRef.value = null
//     }
//   })

//   const loadData: LoadData<T> = (data) => {
//     dataRef.value = data
//   }

//   const search: Search<T> = (query) => {
//     return rtree.search(query)
//   }

//   const flashlight: FlashlightToggle<T> = (eventlibCore) => {
//     const litItemsRef: Ref<T[]> = ref([])

//     const mousemove = (e: EMouseEvent) => {
//       const pos = e.pos
//       const mousePt = coords.mkPoint.fromXy(pos.x, pos.y)
//       const queryBox = coords.boxCenteredAt(mousePt, 8, 8)
//       const hits = rtree.search(queryBox)
//       litItemsRef.value = hits
//     }

//     const handlers: MouseHandlerInit = () => {
//       return {
//         mousemove
//       }
//     }

//     eventlibCore.setMouseHandlers([handlers])

//     const off = () => {
//       // TODO unwatch(litItemsRef)
//     }

//     return {
//       litItemsRef, off
//     }
//   }

//   return {
//     loadData,
//     search,
//     flashlight
//   }
// }
