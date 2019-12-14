
import _ from 'lodash';
import { createComponent, ref, watch, Ref } from '@vue/composition-api';

function findStories() {

  const storyList = process.env.storyList;
  const componentProps = _.map(storyList, (s: string) => {
    const path0 = s.replace('src/', '~/');
    const path = path0.replace('/index.vue', '');
    const p0 = path.replace('/', '-');
    const p1 = p0.replace('/index.vue', '');
    const name = _.camelCase(p1);
    return {
      path,
      name,
    };
  });

  const entries = _.map(componentProps, p => {
    return `${p.name}: () => import('${p.path}' /* webpackChunkName ${p.name} */),`;
  });
  const joined = _.join(entries, 'n');
  console.log(`{\n ${joined}\n}`)


  return {
    componentProps,
  };
}


const storyDefs = findStories();
const cprops = storyDefs.componentProps;

// TODO I can't figure out how to do this dynamically, so I'm printing the component list to the console when starting, then
//   pasting it here:
const components = {
  componentsWidgetsNarrowingFilterStories: () => import('~/components/widgets/narrowing-filter/__stories__/index.vue' /* webpackChunkName componentsWidgetsNarrowingFilterStories */)
};

const storyEntries = _.map(cprops, p => {

  return {
    component: p.name,
    path: p.path,
    title: p.name,
  }
});

function setup() {

  const activeComponent: Ref<string|null> = ref(null);
  const selectedComponent = ref('');
  findStories();

  watch(selectedComponent, (active) => {
    const maybeProp = _.filter(cprops, p => p.name === active);
    if (maybeProp.length > 0) {
      activeComponent.value = active;
    }
  });

  return {
    activeComponent,
    selectedComponent,
    storyEntries,
  };
}


export default createComponent({
  setup,
  components,
})
