import {
  // reactive,
  ref,
  Ref,
  onMounted,
} from '@vue/composition-api';


import { useImgCanvasSvgOverlays  } from '~/components/elem-overlays'
import { initState } from '~/components/component-basics';

export default {
  setup() {

    const state = initState();

    const layerRoot: Ref<HTMLDivElement> = ref(null);
    const containerRef = layerRoot;
    const elemOverlay = useImgCanvasSvgOverlays({ containerRef, state });

    elemOverlay.setDimensions(300, 350);

    onMounted(() => {

    });


    return {
      layerRoot
    };
  }
}
