
import {
  ref,
  Ref,
  onMounted,
} from '@vue/composition-api';


import Layout from '~/components/story-default-layout/index.vue';
import { useImgCanvasOverlays  } from '~/components/compositions/elem-overlays';
import { useTextOverlay  } from '~/components/compositions/text-overlay';
import { initState } from '~/components/compositions/component-basics';

export default {
  components: { Layout },
  setup() {

    const state = initState();

    const mountPoint: Ref<HTMLDivElement|null> = ref(null);
    const elemOverlays = useImgCanvasOverlays({ mountPoint, useTextOverlay: true, state });

    const overlayElements = elemOverlays.elems;

    const textOverlay = useTextOverlay({ overlayElements, state });

    onMounted(() => {
      elemOverlays.setDimensions(300, 350);
      textOverlay.printText(0, 0, "Hello, Why?")
      // Draw text, canvas shape at same point
      // Scale/resize overlays up/down, overlays stay aligned
      // Show dimensions of text in story sidebar

      // drawRect(x, y, w, h)
      // drawText('a b c', at={x, y})

    })


    return {
      mountPoint
    };
  }
}
