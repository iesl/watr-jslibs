
import {
  ref,
  Ref,
} from '@vue/composition-api';


import { useImgCanvasSvgOverlays  } from '~/components/compositions/elem-overlays'
import { useTextOverlay  } from '~/components/compositions/text-overlay'
import { initState } from '~/components/compositions/component-basics';

export default {
  setup() {

    const state = initState();

    const mountPoint: Ref<HTMLDivElement|null> = ref(null);
    const elemOverlay = useImgCanvasSvgOverlays({ mountPoint, state });
    const textOverlay = useTextOverlay({ state });

    // elemOverlay.setDimensions(300, 350);
    // Draw text, canvas shape at same point
    // Scale/resize overlays up/down, overlays stay aligned
    // Show dimensions of text in story sidebar

    // drawRect(x, y, w, h)
    // drawText('a b c', at={x, y})

    return {
      mountPoint
    };
  }
}
