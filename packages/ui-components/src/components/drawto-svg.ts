
import _ from 'lodash';

import {
  Ref,
  watch,
  ref,
} from '@vue/composition-api';

import {
  d3x,
} from "sharedLib";


export function useSvgDrawing(svgRef: Ref<SVGElement>) {
  watch(svgRef, () => {
    const svgElem = svgRef.value;
    if (svgElem === null) return;

    d3x


  });

  return {

  };
}
