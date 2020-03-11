
import TracelogViewer from '~/components/ui-elements/tracelog-viewer/index.vue'
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  layout: 'app-layout',
  components: { TracelogViewer },
  head() {
    const title = "Tracelog Viewer";
    return {
      title
    };
  }
})
