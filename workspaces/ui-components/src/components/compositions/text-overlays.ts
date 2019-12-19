import _ from 'lodash';

import {
  Ref,
} from '@vue/composition-api';

import { StateArgs, waitFor } from '~/components/compositions/component-basics'

export interface TextOverlay {
}


type Args = StateArgs & {
  containerRef: Ref<HTMLDivElement|null>
};

export function useTextOverlay({
  state,
}: Args): TextOverlay {

  waitFor('TextOverlay', {
    state,
    dependsOn: [],
  }, () => {

  });

  return {
  };
}
