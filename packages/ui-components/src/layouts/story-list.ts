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
    title: 'Pdf Page',
    to: 'pdf-page'
  },
  {
    title: 'TextGraph',
    to: 'text-graph'
  },
  {
    title: 'EventLib Core',
    to: 'eventlib-core'
  },
  {
    title: 'Layered image/svg/canvas',
    to: 'elem-overlay'
  }
];


export const storyItems = _.map(stories, (s: StoryEntry) => {
  return {
    icon: 'mdi-apps',
    title: s.title,
    to: `${storyRoot}/${s.to}`
  };
});
