import _ from 'lodash'

import { ref, defineComponent, provide, Ref } from '@vue/composition-api'
import NarrowingFilter from '../index.vue'
import { ProvidedChoices } from '../narrowing-filter'
import { groupTracelogsByKey } from '~/lib/transcript/tracelogs'

import { pipe } from 'fp-ts/lib/pipeable';
import * as TE from 'fp-ts/lib/TaskEither';
import { fetchAndDecodeTracelog } from '~/lib/data-fetch'

export default defineComponent({
  components: {
    NarrowingFilter
  },
  setup() {
    const choicesRef: Ref<Array<string> | null> = ref(null)

    provide(ProvidedChoices, choicesRef)

    const onItemsSelected = (selection: any[]) => {
      console.log('we got items!', selection)
    }

    const entryId = '1503.00580.pdf.d';

    const run = pipe(
      fetchAndDecodeTracelog(entryId),
      TE.mapLeft(errors => {
        _.each(errors, error => console.log('error', error));
        return errors;
      }),
      TE.map(tracelog => {
        const logEntryGroups = groupTracelogsByKey(tracelog)
        const choices = _.map(logEntryGroups, ({ groupKey }) => groupKey)
        choicesRef.value = choices
      })
    );

    run().then(() => {
      console.log('ran fully');
    });

    return {
      onItemsSelected,
      choicesRef
    }
  }
})
