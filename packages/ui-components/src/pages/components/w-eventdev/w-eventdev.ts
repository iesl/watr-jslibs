//
/**
   - pass in div by id to useXX()
   - 
 */
import _ from 'lodash';

import {
  // createComponent,
  reactive,
  computed,
  // watch,
  toRefs
} from '@vue/composition-api';

// import RBush from "rbush";

import {
  coords,
  // MouseHandlerSets,
  MouseHandlers,
  // GridTypes,
  // Point,
  // BBox,
  // tstags,
  // d3x,
  // getOrDie
} from "sharedLib";

import {
  TextDataPoint,
  // initGridData,
  // GridData
} from '~/lib/TextGlyphDataTypes'


function setup() {
  const state = reactive({
    count: 0,
    double: computed(() => state.count * 2)
  })

  function increment() {
    state.count++
  }

  return {
    state,
    increment
  }
}

export function useWEventLib() {
  const pos = reactive({
    x: 0,
    y: 0
  })

  // ...
  // Use toRefs to allow reactive object destructuring by consumer
  return toRefs(pos)
}

export function defaultMouseHandlers(widget: TextGraph): MouseHandlers {
  return {
    mousedown: (event: object)  => {
      const userPt = coords.mkPoint.offsetFromJqEvent(event);

      const textgridRTree = widget.textgridRTree;

      const queryWidth = 2;
      const queryBoxHeight = 2;
      const queryLeft = userPt.x - queryWidth / 2;
      const queryTop = userPt.y - queryBoxHeight / 2;
      const queryBox = coords.mk.fromLtwh(queryLeft, queryTop, queryWidth, queryBoxHeight);

      const hits: TextDataPoint[] = textgridRTree.search(queryBox);

      const queryHits = _.sortBy(
        _.filter(hits, (hit) => hit.glyphData !== undefined),
        (hit) => [hit.minY, hit.minX]
      );


      if (queryHits.length > 0) {
        widget.setClickedText(queryHits[0]);
      }
    },
    mousemove: (event: object)  => {
      const userPt = coords.mkPoint.offsetFromJqEvent(event);

      const textgridRTree = widget.textgridRTree;

      const queryWidth = 4;
      const queryBoxHeight = 4;
      const queryLeft = userPt.x - queryWidth / 2;
      const queryTop = userPt.y - queryBoxHeight / 2;
      const queryBox = coords.mk.fromLtwh(queryLeft, queryTop, queryWidth, queryBoxHeight);

      const hits: TextDataPoint[] = textgridRTree.search(queryBox);

      const queryHits = _.sortBy(
        _.filter(hits, (hit) => hit.glyphData !== undefined),
        (hit) => [hit.minY, hit.minX]
      );


      widget.hoverQuery = [ queryBox ];
      widget.setHoveredText(queryHits);
    },
  };

}

export default {
  setup
}
