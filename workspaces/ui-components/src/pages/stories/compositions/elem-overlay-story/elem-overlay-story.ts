import {
  // reactive,
  ref,
  Ref,
  onMounted,
} from '@vue/composition-api';


import { useImgCanvasSvgOverlays  } from '~/components/compositions/elem-overlays'
import { initState } from '~/components/compositions/component-basics';

export default {
  setup() {

    const state = initState();

    const mountPoint: Ref<HTMLDivElement|null> = ref(null);
    const elemOverlay = useImgCanvasSvgOverlays({ mountPoint, state });

    elemOverlay.setDimensions(300, 350);

    onMounted(() => {

    });


    return {
      mountPoint
    };
  }
}
