import {
  ref,
  Ref,
  onMounted,
} from '@vue/composition-api';


import { useElemOverlays, OverlayType } from '~/components/elem-overlays'

import { useCanvasDrawto } from '~/components/drawto-canvas';

export default {
  setup() {

    const layerRoot: Ref<HTMLDivElement> = ref(null);

    const elemOverlay = useElemOverlays(layerRoot, OverlayType.Img, OverlayType.Canvas, OverlayType.Svg);
    const canvasElemRef = elemOverlay.elems.canvasElem
    const canvasDrawto = useCanvasDrawto(canvasElemRef);

    elemOverlay.setDimensions(600, 800);

    onMounted(() => {

    });


    return {
      layerRoot
    };
  }
}
