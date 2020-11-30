import _ from 'lodash'

import { ref, defineComponent, provide, Ref } from '@vue/composition-api'
import NarrowingFilter from '../index.vue'
import { ProvidedChoices } from '../narrowing-filter'
import { configAxios, getArtifactData } from '~/lib/axios'
import { groupTracelogsByKey } from '~/lib/tracelogs'

export default defineComponent({
  components: {
    NarrowingFilter
  },
  setup() {
    const candidatesUrl = '/tracelogs/tracelog.json'
    const choicesRef: Ref<Array<string> | null> = ref(null)

    provide(ProvidedChoices, choicesRef)

    const onItemsSelected = (selection: any[]) => {
      console.log('we got items!', selection)
    }

    const entryId = '1503.00580.pdf.d'
    getArtifactData(entryId, 'tracelog', 'tracelog')
      .then((tracelogJson) => {
        const logEntryGroups = groupTracelogsByKey(tracelogJson)
        const choices = _.map(logEntryGroups, ({ groupKey }) => groupKey)
        choicesRef.value = choices
      })

    return {
      onItemsSelected,
      choicesRef
    }
  }
})
