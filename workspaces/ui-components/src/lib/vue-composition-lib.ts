//

import {
  ref,
  Ref,
} from '@vue/composition-api';


export function divRef(): Ref<HTMLDivElement|null> {
  return ref(null);
}
