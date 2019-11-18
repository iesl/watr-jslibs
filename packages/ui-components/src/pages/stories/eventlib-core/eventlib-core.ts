/**
 *
 */
import _ from 'lodash';

import { onMounted, ref } from '@vue/composition-api';
import { useWEventLib } from '~/components/eventlib-core/eventlib-core'
import { coords } from "sharedLib";


import { useElemOverlays, OverlayType } from '~/components/elem-overlays/elem-overlays'

function setup() {
  const overlayRoot = ref(null)

  const {
    mousePosRef, loadShapes, hoveringRef
  } = useWEventLib(overlayRoot);

  const elemOverlay = useElemOverlays(overlayRoot, OverlayType.Img, OverlayType.Canvas, OverlayType.Svg);

  onMounted(() => {

    elemOverlay.setDimensions(800, 800);

    const bbox = coords.mk.fromLtwh(20, 40, 200, 444);

    loadShapes([bbox]);
  });

  return {
    mousePosRef, loadShapes, hoveringRef, overlayRoot
  }
}


export default {
  setup
}
