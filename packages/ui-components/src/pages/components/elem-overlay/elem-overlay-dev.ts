import {
  // reactive,
  ref,
  Ref,
  onMounted,
} from '@vue/composition-api';


import { useElemOverlays, OverlayType } from '~/components/elem-overlays/elem-overlays'

export default {
  setup() {

    const layerRoot: Ref<HTMLDivElement> = ref(null);

    const elemOverlay = useElemOverlays(layerRoot, OverlayType.Img, OverlayType.Canvas, OverlayType.Svg);

    elemOverlay.setDimensions(300, 350);

    onMounted(() => {

    });


    return {
      layerRoot
    };
  }
}
