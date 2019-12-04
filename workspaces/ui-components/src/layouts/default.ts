
import { storyItems } from '~/pages/stories/story-list';

export default {

  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      items: [
        { icon: 'mdi-apps', title: 'Welcome', to: '/' },
        ...storyItems
      ],
      miniVariant: false,
      right: false,
      rightDrawer: false,
      title: 'UI Component Development Stories'
    }
  }
}
