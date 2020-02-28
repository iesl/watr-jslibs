import { createComponent } from '@vue/composition-api'

/* @ts-ignore */
export default createComponent({
  layout: 'empty',
  props: {
    error: {
      type: Object,
      default: null
    }
  },

  data(): object {
    return {
      pageNotFound: '404 Not Found',
      otherError: 'An error occurred'
    }
  },

  head(): any {
    const title = this.error.statusCode === 404 ? this.pageNotFound : this.otherError
    return {
      title
    }
  }
});
