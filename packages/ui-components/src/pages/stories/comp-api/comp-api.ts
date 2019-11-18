//
import {
  createComponent,
  reactive,
  computed,
  watch,
  toRefs
} from '@vue/composition-api';


// type inference enabled
// const Component = createComponent({});

function setup() {
  const state = reactive({
    count: 0,
    double: computed(() => state.count * 2)
  })

  function increment() {
    state.count++
  }

  return {
    state,
    increment
  }
}

function useMousePosition() {
  const pos = reactive({
    x: 0,
    y: 0
  })

  // ...
  // Use toRefs to allow reactive object destructuring by consumer
  return toRefs(pos)
}

// const renderContext = setup()

export default {
  setup
}
