//
import _ from 'lodash';
const storyRoot = '/stories'

type StoryEntry = {
  title: string;
  to: string;
  icon?: string;
}



const stories: StoryEntry[] = [
  {
    title: 'Pdf Page Viewer',
    to: 'widgets/pdf-page-story'
  },
  {
    title: 'Tracelog Viewer',
    to: 'widgets/tracelog-viewer-story'
  },
  {
    title: 'TextGraph',
    to: 'widgets/text-graph-story'
  },
  {
    title: 'EventLib Core',
    to: 'compositions/eventlib/core-story'
  },
  {
    title: 'Hover EventLib',
    to: 'compositions/eventlib/hover-story'
  },
  {
    title: 'Layered image/svg/canvas',
    to: 'compositions/elem-overlay-story'
  },
  { title: 'Canvas Drawto',
    to: 'compositions/drawto/drawto-canvas-story'
  },
  { title: 'SketchLib Core',
    to: 'compositions/sketchlib/sketchlib-core-story'
  },
  { title: 'Narrowing Filter Selection',
    to: 'widgets/narrowing-filter-story'
  },
];


export const storyItems = _.map(stories, (s: StoryEntry) => {
  return {
    icon: 'mdi-apps',
    title: s.title,
    to: `${storyRoot}/${s.to}`
  };
});
