import _ from 'lodash';

import NarrowingFilter from '../index.vue';
import { ProvidedCandidatesUrl } from '../narrowing-filter';
import { ref, createComponent, provide, Ref } from '@vue/composition-api';


export default createComponent({
  setup() {
    const candidatesUrlRef: Ref<string|null> = ref(null)
    provide(ProvidedCandidatesUrl, candidatesUrlRef);
    candidatesUrlRef.value = '/tracelogs/tracelog.json';

    return {
    };
  },
  components: {
    NarrowingFilter
  },
});
