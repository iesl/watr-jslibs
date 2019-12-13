//
import _ from 'lodash';

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
];

// TODO I'm trying to integrate the stories into the same tree as the component definitions
const otherStories: StoryEntry[] = [
  { title: 'Narrowing Filter Selection',
    to: '/components/widgets/narrowing-filter/__stories__'
  },
];


const pageStories = _.map(stories, (s: StoryEntry) => {
  const storyRoot = '/pages/stories'
  return {
    icon: 'mdi-apps',
    title: s.title,
    to: `${storyRoot}/${s.to}`
  };
});


export const storyItems = _.concat(pageStories, otherStories);
