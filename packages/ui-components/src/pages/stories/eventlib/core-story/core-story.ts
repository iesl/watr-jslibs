/**
 *
 */
import _ from 'lodash';

import { onMounted, ref } from '@vue/composition-api';
import { useEventlibCore } from '~/components/eventlib-core'
import { coords } from "sharedLib";


import { useElemOverlays, OverlayType } from '~/components/elem-overlays'

function setup() {
  const overlayRoot = ref(null)

  const {
    mousePosRef, loadShapes
  } = useEventlibCore(overlayRoot);

  const elemOverlay = useElemOverlays(overlayRoot, OverlayType.Img, OverlayType.Canvas, OverlayType.Svg);

  onMounted(() => {

    elemOverlay.setDimensions(800, 800);

    // const bbox = coords.mk.fromLtwh(20, 40, 200, 444);

    // loadShapes([bbox]);
  });

  return {
    mousePosRef, loadShapes, overlayRoot
  }
}


export default {
  setup
}
