
/** @ts-ignore */

import _ from 'lodash';
import { createComponent, ref, watch, Ref, reactive, toRefs } from '@vue/composition-api';


// @ts-ignore
import componentsCompositionsStoriesDrawtoDrawtoCanvasStory from '~/components/compositions/__stories__/drawto/drawto-canvas-story' ;
// @ts-ignore
import componentsCompositionsStoriesElemOverlayStory from '~/components/compositions/__stories__/elem-overlay-story' ;
// @ts-ignore
import componentsCompositionsStoriesEventlibCoreStory from '~/components/compositions/__stories__/eventlib/core-story' ;
// @ts-ignore
import componentsCompositionsStoriesEventlibHoverStory from '~/components/compositions/__stories__/eventlib/hover-story' ;
// @ts-ignore
import componentsCompositionsStoriesSketchlibSketchlibCoreStory from '~/components/compositions/__stories__/sketchlib/sketchlib-core-story' ;
// @ts-ignore
import componentsWidgetsNarrowingFilterStories from '~/components/widgets/narrowing-filter/__stories__' ;
// @ts-ignore
import componentsWidgetsPdfPageViewerStoriesPdfPageStory from '~/components/widgets/pdf-page-viewer/__stories__/pdf-page-story' ;
// @ts-ignore
import componentsWidgetsPdfTextViewerStoriesPdfTextViewerStory from '~/components/widgets/pdf-text-viewer/__stories__/pdf-text-viewer-story' ;
// @ts-ignore
import componentsWidgetsPdfTextViewerStoriesPdfTextViewerStoryTextGraphStory from '~/components/widgets/pdf-text-viewer/__stories__/pdf-text-viewer-story/text-graph-story' ;
// @ts-ignore
import componentsWidgetsTracelogViewerStoriesTracelogViewerStory from '~/components/widgets/tracelog-viewer/__stories__/tracelog-viewer-story' ;
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';

const storyEntries = [
  { title: 'componentsCompositionsStoriesDrawtoDrawtoCanvasStory', name: 'componentsCompositionsStoriesDrawtoDrawtoCanvasStory' },
  { title: 'componentsCompositionsStoriesElemOverlayStory', name: 'componentsCompositionsStoriesElemOverlayStory' },
  { title: 'componentsCompositionsStoriesEventlibCoreStory', name: 'componentsCompositionsStoriesEventlibCoreStory' },
  { title: 'componentsCompositionsStoriesEventlibHoverStory', name: 'componentsCompositionsStoriesEventlibHoverStory' },
  { title: 'componentsCompositionsStoriesSketchlibSketchlibCoreStory', name: 'componentsCompositionsStoriesSketchlibSketchlibCoreStory' },
  { title: 'componentsWidgetsNarrowingFilterStories', name: 'componentsWidgetsNarrowingFilterStories' },
  { title: 'componentsWidgetsPdfPageViewerStoriesPdfPageStory', name: 'componentsWidgetsPdfPageViewerStoriesPdfPageStory' },
  { title: 'componentsWidgetsPdfTextViewerStoriesPdfTextViewerStory', name: 'componentsWidgetsPdfTextViewerStoriesPdfTextViewerStory' },
  { title: 'componentsWidgetsPdfTextViewerStoriesPdfTextViewerStoryTextGraphStory', name: 'componentsWidgetsPdfTextViewerStoriesPdfTextViewerStoryTextGraphStory' },
  { title: 'componentsWidgetsTracelogViewerStoriesTracelogViewerStory', name: 'componentsWidgetsTracelogViewerStoriesTracelogViewerStory' },
];

const components = {
  componentsCompositionsStoriesDrawtoDrawtoCanvasStory: componentsCompositionsStoriesDrawtoDrawtoCanvasStory,
  componentsCompositionsStoriesElemOverlayStory: componentsCompositionsStoriesElemOverlayStory,
  componentsCompositionsStoriesEventlibCoreStory: componentsCompositionsStoriesEventlibCoreStory,
  componentsCompositionsStoriesEventlibHoverStory: componentsCompositionsStoriesEventlibHoverStory,
  componentsCompositionsStoriesSketchlibSketchlibCoreStory: componentsCompositionsStoriesSketchlibSketchlibCoreStory,
  componentsWidgetsNarrowingFilterStories: componentsWidgetsNarrowingFilterStories,
  componentsWidgetsPdfPageViewerStoriesPdfPageStory: componentsWidgetsPdfPageViewerStoriesPdfPageStory,
  componentsWidgetsPdfTextViewerStoriesPdfTextViewerStory: componentsWidgetsPdfTextViewerStoriesPdfTextViewerStory,
  componentsWidgetsPdfTextViewerStoriesPdfTextViewerStoryTextGraphStory: componentsWidgetsPdfTextViewerStoriesPdfTextViewerStoryTextGraphStory,
  componentsWidgetsTracelogViewerStoriesTracelogViewerStory: componentsWidgetsTracelogViewerStoriesTracelogViewerStory,
};

interface Props {
  storyid: string;
}


function setup(props: Props) {
  // const props  = toRefs(reactive({
  //   storyid: ''
  // }));

  const activeComponent: Ref<string|null> = ref(null);
  const selectedComponent = ref('');

  watch(() => {
    console.log('props', props.storyid);
  })

  watch(selectedComponent, (active) => {
    const maybeProp = _.filter(storyEntries, p => p.name === active);
    if (maybeProp.length > 0) {
      activeComponent.value = active;
    }
  });

  return {
    activeComponent,
    selectedComponent,
    storyEntries,
    props,
  };
}


export default createComponent({
  setup,
  components,
  props: {
    storyid: String
  },
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      // items: [
      //   { icon: 'mdi-apps', title: 'Welcome', to: '/' },
      // ],
      miniVariant: false,
      right: false,
      rightDrawer: false,
      title: 'UI Component Development Stories'
    }
  }
})
