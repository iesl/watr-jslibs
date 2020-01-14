/**
 * Initialize and return an rtree interface
 */

import _ from 'lodash';
import RBush from "rbush";

import {
  Ref,
  watch,
  ref,
} from '@vue/composition-api';

import { StateArgs } from '~/components/basics/component-basics'
import * as coords from '~/lib/coord-sys';
import { BBox } from '~/lib/coord-sys';
import { EMouseEvent, MouseHandlerInit } from '~/lib/EventlibHandlers';
import { EventlibCore } from './eventlib-core';

type LoadData<T> = (data: T[]) => void;
type Search<T> = (query: BBox) => T[];

interface Flashlight<T> {
  off(): void;
  litItemsRef: Ref<T[]>;
}

type FlashlightToggle<T> = (eventlibCore: EventlibCore) => Flashlight<T>;

export interface RTreeIndex<T> {
  loadData: LoadData<T>;
  search: Search<T>;
  flashlight: FlashlightToggle<T>;
}

type Args = StateArgs & {}

export function useRTreeIndex<T>({
}: Args): RTreeIndex<T> {
  const rtree: RBush<T> = new RBush<T>();
  const dataRef: Ref<T[] | null> = ref(null);


  watch(dataRef, () => {
    const data = dataRef.value;
    if (data) {
      rtree.load(data);
      dataRef.value = null;
    }
  });

  const loadData: LoadData<T> = (data) => {
    dataRef.value = data;
  }

  const search: Search<T> = (query) => {
    return rtree.search(query);
  }

  const flashlight: FlashlightToggle<T> = (eventlibCore) => {
    const litItemsRef: Ref<T[]> = ref([]);

    const mousemove = (e: EMouseEvent) => {
      const pos = e.pos;
      const mousePt = coords.mkPoint.fromXy(pos.x, pos.y);
      const queryBox = coords.boxCenteredAt(mousePt, 8, 8);
      const hits = rtree.search(queryBox);
      litItemsRef.value = hits;
    }

    const handlers: MouseHandlerInit = () =>  {
      return {
        mousemove,
      }
    }

    eventlibCore.setMouseHandlers([handlers]);

    const off = () => {
      // TODO unwatch(litItemsRef)
    };

    return {
      litItemsRef, off
    };
  }

  return {
    loadData,
    search,
    flashlight
  };

}
