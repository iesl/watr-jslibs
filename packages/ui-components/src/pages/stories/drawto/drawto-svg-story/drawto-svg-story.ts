import {
  ref,
  Ref,
  onMounted,
} from '@vue/composition-api';


import { useElemOverlays, OverlayType } from '~/components/elem-overlays'
import { useSvgDrawing } from '~/components/drawto-svg';

export default {
  setup() {

    const layerRoot: Ref<HTMLDivElement> = ref(null);

    const elemOverlay = useElemOverlays(layerRoot, OverlayType.Img, OverlayType.Canvas, OverlayType.Svg);
    const svgElemRef = elemOverlay.elems.svgElem

    const svgDrawing = useSvgDrawing(svgElemRef);

    elemOverlay.setDimensions(600, 800);

    onMounted(() => {

    });


    return {
      layerRoot
    };
  }
}
