//

import _ from 'lodash';
import RBush from "rbush";

import {
  Ref,
  watch,
  ref,
} from '@vue/composition-api';

import { StateArgs } from '~/components/component-basics'
import { BBox, Point } from 'sharedLib';
import { TextDataPoint } from '~/lib/TextGlyphDataTypes';

type LoadData<T> = (data: T[]) => void;
type Search<T> = (query: BBox) => T[];
type NearTo<T> = (p: Point, range: number) => T[];

export interface RTreeSearch<T> {
  loadData: LoadData<T>;
  search: Search<T>;
  nearTo: NearTo<T>;
}

type Args = StateArgs & {}

export function useRTreeSearch<T>({
  state,
}: Args): RTreeSearch<T> {
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

  const nearTo: NearTo<T> = (p, r) => {
    return [];
  }

  return {
    loadData,
    search,
    nearTo,
  };

}
