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
    title: 'Pdf Pages (orig)',
    to: 'pdf-page-old-story'
  },
  {
    title: 'Pdf Page (new)',
    to: 'pdf-page-story'
  },
  {
    title: 'TextGraph',
    to: 'text-graph-story'
  },
  {
    title: 'EventLib Core',
    to: 'eventlib/core-story'
  },
  {
    title: 'Hover EventLib',
    to: 'eventlib/hover-story'
  },
  {
    title: 'Layered image/svg/canvas',
    to: 'elem-overlay-story'
  },
  { title: 'Canvas Drawto',
    to: 'drawto/drawto-canvas-story'
  },
  { title: 'SketchLib Core',
    to: 'sketchlib/sketchlib-core-story'
  },
  { title: 'Filter Selection',
    to: 'filter-select'
  },
];


export const storyItems = _.map(stories, (s: StoryEntry) => {
  return {
    icon: 'mdi-apps',
    title: s.title,
    to: `${storyRoot}/${s.to}`
  };
});
