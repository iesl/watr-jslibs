
import { storyItems } from '~/pages/stories/story-list';
import collectedStories from '~/pages/stories/collected-stories/index.vue';

export default {
  components: {
    collectedStories,
  },

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
