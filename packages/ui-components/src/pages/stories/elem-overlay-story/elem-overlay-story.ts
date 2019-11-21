import {
  // reactive,
  ref,
  Ref,
  onMounted,
} from '@vue/composition-api';


import { useImgCanvasSvgOverlays  } from '~/components/elem-overlays'

export default {
  setup() {

    const layerRoot: Ref<HTMLDivElement> = ref(null);

    const elemOverlay = useImgCanvasSvgOverlays(layerRoot);

    elemOverlay.setDimensions(300, 350);

    onMounted(() => {

    });


    return {
      layerRoot
    };
  }
}
