/**
 *
 */
import _ from 'lodash';

import {
  useWEventLib,
} from '~/components/w-eventlib/w-eventlib'

import {
  coords,
} from "sharedLib";


function setup() {
  const {
    mousePosRef, loadShapes, hoveringRef, setDiv
  } = useWEventLib();

  setDiv('event-div');

  // const { loadShapes, mousePosRef, hoverRef, nearRef, mouseHandlerRef } =
  //    useWEventLib('event-div', queryShape, knnDist)

  const bbox = coords.mk.fromLtwh(20, 40, 200, 444);

  loadShapes([bbox]);

  return {
    mousePosRef, loadShapes, hoveringRef
  }
}


export default {
  setup
}
