import {
  ref,
  Ref,
} from '@vue/composition-api';


import Layout from '~/components/story-default-layout/index.vue';
import { useSuperimposedElements, ElementTypes  } from '~/components/compositions/superimposed-elements'
import { initState } from '~/components/compositions/component-basics';

export default {
  components: { Layout },
  setup() {

    const state = initState();

    const mountPoint: Ref<HTMLDivElement|null> = ref(null);
    const elemOverlay = useSuperimposedElements({
      includeElems: [ElementTypes.Img, ElementTypes.Canvas, ElementTypes.Svg, ElementTypes.Text],
      mountPoint, state });

    elemOverlay.setDimensions(300, 350);

    return {
      mountPoint
    };
  }
}
