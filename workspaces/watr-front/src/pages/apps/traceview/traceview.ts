
import { defineComponent } from '@vue/composition-api'
import TracelogViewer from '~/components/multi-pane/tracelog-viewer/index.vue'

export default defineComponent({
  components: { TracelogViewer },
  layout: 'app-layout',
  head() {
    const title = 'Tracelog Viewer'
    return {
      title
    }
  }
})
