
import Vue from 'vue';
import { storiesOf } from '@storybook/vue'

import store from '~/../.storybook/store'
import List from './List'




storiesOf('Lists', module)
  .add('Users', () => ({
    components: { List },
    store: store,
    template: '<List />'
  }))
  .add('Comments', () => ({
    components: { List },
    store: store,
    template: `<List :source="'comments'" />`
  }))
