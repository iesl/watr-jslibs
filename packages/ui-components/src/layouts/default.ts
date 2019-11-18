
import { storyItems } from './story-list';

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
      right: true,
      rightDrawer: false,
      title: 'UI Component Dev'
    }
  }
}
