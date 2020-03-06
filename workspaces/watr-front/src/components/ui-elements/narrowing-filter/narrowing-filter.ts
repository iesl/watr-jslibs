import _ from 'lodash';

import { ref, watch, Ref, createComponent, inject, SetupContext  } from '@vue/composition-api';

export const ProvidedChoices = 'ProvidedChoices';

export default createComponent({
  setup(_props, ctx: SetupContext) {
    const { emit } = ctx;

    const currSelectionRef = ref([] as string[])
    const queryTextRef = ref('');

    const choicesRef: Ref<Array<string> | null> = inject(ProvidedChoices, ref(null))

    const onSubmit = () => {
      emit('items-selected', currSelectionRef.value);
    };

    const onReset = () => {
      queryTextRef.value = '';
      currSelectionRef.value = [];
    };

    watch(choicesRef, (choices: string[] | null) => {
      if (choices===null) return;

      const choicesLC = choices.map(c => [c, c.toLowerCase()] as const);

      const updateSelection = (query: string) => {
        const terms = query.split(/[ ]+/g);
        const hits = _.filter(choicesLC, ([, choice]) => {
          const lc = choice.toLowerCase();
          return _.every(terms, term => lc.includes(term))
        });

        currSelectionRef.value = _.map(hits, ([ch,]) => ch);
      }
      const debounced = _.debounce(updateSelection, 300);

      watch(queryTextRef, (queryText) => {
        debounced(queryText);
      });


    });




    return {
      currSelectionRef,
      queryTextRef,
      onSubmit,
      onReset,
    };

  }
});
