
import {
  ref,
  Ref,
  watch,
  onMounted,
} from '@vue/composition-api';


import { useElemOverlays, OverlayType } from '~/components/elem-overlays'

import { usePixiJsDrawto } from '~/components/drawto-pixijs';

export default {
  setup() {

    const containerDivRef: Ref<HTMLDivElement> = ref(null);
    const canvasElemRef: Ref<HTMLCanvasElement> = ref(null);

    const canvasDrawto = usePixiJsDrawto(canvasElemRef, containerDivRef);

    watch(containerDivRef, (div) => {
      if (div === null) return;
      div.setAttribute('width', '300px')
      div.setAttribute('height', '400px')
    });


    onMounted(() => {

    });


    return {
      containerDivRef, canvasElemRef
    };
  }
}
