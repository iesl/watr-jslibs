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

    onMounted(() => {
      const ret = useElemOverlays(layerRoot.value, OverlayType.Img, OverlayType.Canvas, OverlayType.Svg);



    });



    return {
      layerRoot
    };
  }
}
