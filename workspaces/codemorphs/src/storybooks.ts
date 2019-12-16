import _ from 'lodash';
import path from 'path';
import fs, { Dirent } from 'fs-extra';

import { Project, SourceFile, Directory } from "ts-morph";

interface StoryPaths {
  name: string;
  pathname: string;
}

export function setupStoryVues(tsconfigPath: string) {

  const project = new Project({
    tsConfigFilePath: tsconfigPath,
  });

  const storyOutputDir = 'stories-autogen.d';
  let autoDir = project.getDirectory(storyOutputDir)
  if (autoDir) {
    console.log('autoDir exists, deleting...')
    autoDir.deleteImmediatelySync();
  }
  console.log(`creating autoDir ${storyOutputDir}...`)
  autoDir = project.createDirectory(storyOutputDir);

  const storyList = findStories(project);
  _.each(storyList, (storyPath: StoryPaths) => {
    const [_x, post] = storyPath.pathname.split('/src/');
    const pathParts = post.split('/');
    const storyName = pathParts[pathParts.length-2];

    const vueContent = `
<script lang="ts">
  import comp from '~/${post}/${storyPath.name}'
  export default { comp };
</script>
<template lang="html">
  <component :is='comp' />
</template>
`;
    console.log(`create story ${storyName} in ${autoDir.getPath()}`)
    console.log(vueContent, '\n\n');
    // autoDir.createSourceFile(storyName, vueContent);

  });

}

// story-name=myStory
// story-category=widget

function findStories(project: Project): StoryPaths[] {
  // const srcFiles = project.getSourceFiles()
  const projectDirs = project.getDirectories();
  const r: StoryPaths[]  = _.flatMap(projectDirs, (dir: Directory) => {
    const pathname = dir.getPath();
    const isStoryPath = pathname.includes('__stories__');
    if (isStoryPath) {
      const dirEntries = fs.readdirSync(pathname, { withFileTypes: true });
      return _.flatMap(dirEntries, (dirEntry: Dirent) => {
        const name = dirEntry.name;
        const isVueFile = dirEntry.isFile() && name.endsWith('.vue');
        if (!isVueFile) return [];
        return [
          { name, pathname }
        ];
      });
    }
    return [];
  });

  return r;
}



// const baseUrl = project.getCompilerOptions().baseUrl!;

// const at = (fname: string) => {
//   const p = path.join(baseUrl, rootPath, componentName, fname)
//   return p;
// }

//   const vueFile = at('index.vue');
// const vueSourceFile = project.createSourceFile(vueFile, vueContent).saveSync();






// _.each(storySources, (source: SourceFile) => {
//   const filename = source.getBaseName();
//   console.log(`story: ${filename}`);
//   //     const vueContent = `
//   // <template lang="html" src="./${componentName}.html"></template>
//   // <script lang="ts" src="./${componentName}.ts"></script>
//   // <style lang="scss" src="./${componentName}.scss" scoped></style>
//   // `;

// })

//   const componentProps = _.map(storyList, (s) => {
//     const path0 = s.replace('src/', '~/');
//     const path = path0.replace('/index.vue', '');
//     const p0 = path.replace('/', '-');
//     const p1 = p0.replace('/index.vue', '');
//     const name = _.camelCase(p1);
//     return {
//       path,
//       name
//     };
//   });

//   const imports = _.map(componentProps, p => {
//     return `
// // @ts-ignore
// import ${p.name} from '${p.path}' ;`;
//   });

//   const joined = _.join(imports, '\n');
//   console.log(`${joined}\n`);

//   const entries = _.map(componentProps, p => {
//     return `{ title: '${p.name}', name: '${p.name}' }`;
//   });

//   const joined2 = _.join(entries, ',\n');
//   console.log(`const storyEntries = [\n ${joined2}\n];`);

//   const componentDict = _.map(componentProps, p => {
//     return `${p.name}: ${p.name},`;
//   });

//   const joined3 = _.join(componentDict, '\n');
//   console.log(`const components = {\n ${joined3}\n};`);

// const tsconfigRPath = fs.realpathSync(tsconfigPath);
// const tsconfigDir = path.dirname(tsconfigRPath);
// // const rootDirs = project.getRootDirectories();
// const rootDirs = project.getDirectories();
// _.each(rootDirs, (rootDir: Directory) => {
//   const rootPath = rootDir.getPath();
//   const relPath = path.relative(rootPath, tsconfigDir);
//   // const rootPath.substring(tsconfigRPath.length);
//   // console.log('rootDir', rootDir.getPath());
//   // console.log('relPath', relPath);
// });
