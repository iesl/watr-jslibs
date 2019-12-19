import {
  // reactive,
  ref,
  Ref,
  onMounted,
} from '@vue/composition-api';


import Layout from '~/components/story-default-layout/index.vue';
import { useImgCanvasSvgOverlays  } from '~/components/compositions/elem-overlays'
import { initState } from '~/components/compositions/component-basics';

export default {
  components: { Layout },
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
