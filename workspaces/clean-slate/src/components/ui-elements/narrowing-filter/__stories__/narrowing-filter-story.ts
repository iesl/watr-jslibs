import _ from 'lodash';

import NarrowingFilter from '../index.vue';
import { ProvidedChoices } from '../narrowing-filter';
import { ref, createComponent, provide, Ref } from '@vue/composition-api';
import { configAxios } from '~/lib/axios';
import { groupTracelogsByKey } from '~/lib/tracelogs';


export default createComponent({
  setup() {
    const candidatesUrl = '/tracelogs/tracelog.json';
    const choicesRef: Ref<Array<string> | null> = ref(null)

    provide(ProvidedChoices, choicesRef);

    const onItemsSelected = (selection: any[]) => {
      console.log('we got items!', selection);
    }

    configAxios().get(candidatesUrl)
      .then(resp => {
        const tracelogJson = resp.data;

        const logEntryGroups = groupTracelogsByKey(tracelogJson);
        const choices = _.map(logEntryGroups, ({groupKey}) => groupKey);
        choicesRef.value = choices;
      });

    return {
      onItemsSelected,
      choicesRef
    };
  },
  components: {
    NarrowingFilter
  },
});
