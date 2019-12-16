
const path = require('path');
const fs = require('fs');

import _ from 'lodash';

function findStories() {

  const storyList = [];

  function _go(pathname) {
    const dirs = fs.readdirSync(pathname, { withFileTypes: true });
    for (const dirent of dirs) {
      const entryName = path.join(pathname, dirent.name);
      if (dirent.isDirectory()) {
        _go(entryName);
      } else if (entryName.includes('__stories__') && entryName.endsWith('.vue')) {
        storyList.push(entryName);
      }
    }
  }

  _go('./src');

  console.log("storyList", storyList);

  const componentProps = _.map(storyList, (s) => {
    const path0 = s.replace('src/', '~/');
    const path = path0.replace('/index.vue', '');
    const p0 = path.replace('/', '-');
    const p1 = p0.replace('/index.vue', '');
    const name = _.camelCase(p1);
    return {
      path,
      name
    };
  });

  const imports = _.map(componentProps, p => {
    return `
// @ts-ignore
import ${p.name} from '${p.path}' ;`;
  });

  const joined = _.join(imports, '\n');
  console.log(`${joined}\n`);

  const entries = _.map(componentProps, p => {
    return `{ title: '${p.name}', name: '${p.name}' }`;
  });

  const joined2 = _.join(entries, ',\n');
  console.log(`const storyEntries = [\n ${joined2}\n];`);

  const componentDict = _.map(componentProps, p => {
    return `${p.name}: ${p.name},`;
  });

  const joined3 = _.join(componentDict, '\n');
  console.log(`const components = {\n ${joined3}\n};`);

}

findStories();

