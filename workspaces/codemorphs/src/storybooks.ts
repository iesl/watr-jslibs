import _ from 'lodash';
import path from 'path';
import fs, { Dirent } from 'fs-extra';

import { Project, Directory } from "ts-morph";

interface StoryPaths {
  generatedStoryVueFile: string;
  storyBaseName: string;
  storyTitle: string;
  vueImportName: string;
}

export function setupStoryVues(tsconfigPath: string, dryrun: boolean) {

  const project = new Project({
    tsConfigFilePath: tsconfigPath,
  });

  const tsconfigRPath = fs.realpathSync(tsconfigPath);
  const tsconfigDir = path.dirname(tsconfigRPath);

  const storyOutputDir = path.join(tsconfigDir,  'stories-autogen.d');


  if (fs.existsSync(storyOutputDir)) {
    console.log('autoDir exists, deleting...')
    fs.removeSync(storyOutputDir);
  }
  console.log(`creating autoDir ${storyOutputDir}...`)
  fs.mkdir(storyOutputDir);

  const storyList = findStories(project);
  _.each(storyList, (storyPath: StoryPaths) => {

    const storyBaseName = storyPath.storyBaseName;
    const vueContent = `
<script lang="ts">
import vueComponent from '${storyPath.vueImportName}'
export default { components: { vueComponent } }
</script>
<template lang="html">
<vueComponent />
</template>
`.trimLeft();

    const fullStoryPath = path.join(storyOutputDir, storyPath.generatedStoryVueFile);
    console.log(`creating story ${storyBaseName} in ${fullStoryPath}`)
    console.log(vueContent);

    if (!dryrun) {
      fs.writeFileSync(fullStoryPath, vueContent);
    }

  });

  const storyRecs = _.map(storyList, (storyPath: StoryPaths) => {
    const storyBaseName = storyPath.storyBaseName;
    const storyTitle = storyPath.storyTitle;
    const entry = `
{ title: '${storyTitle}', to: '/stories/autogen/${storyBaseName}' },
`.trim();
    return entry;
  });

  const entries = _.join(storyRecs, '\n  ');
  const storylistFileContent = `
// Auto-generated file
export type StoryEntry = {
  title: string;
  to: string;
  icon?: string;
}

export const storyItems: StoryEntry[] = [
  ${entries}
];

`;

  const storyListFile = path.join(storyOutputDir, 'story-list.ts');
  if (!dryrun) {
    fs.writeFileSync(storyListFile, storylistFileContent);
  }
}

function getStoryProp(fileContent: string, propname: string): string | undefined {
  const lines = fileContent.split('\n');
  const propLine = _.filter(lines, l => l.includes(`${propname}=`));
  let propValue = undefined;
  if (propLine.length > 0) {
    propValue = propLine[0].split('=')[1].trim();
  }
  return propValue;
}

// story-name=myStory
// story-category=widget

function findStories(project: Project): StoryPaths[] {
  // const srcFiles = project.getSourceFiles()
  const projectDirs = project.getDirectories();
  const r: StoryPaths[]  = _.flatMap(projectDirs, (dir: Directory) => {
    const projSubdir = dir.getPath();
    const isStoryPath = projSubdir.includes('__stories__');
    if (isStoryPath) {
      const dirEntries = fs.readdirSync(projSubdir, { withFileTypes: true });
      return _.flatMap(dirEntries, (dirEntry: Dirent) => {
        const vueFileName = dirEntry.name;
        const isVueFile = dirEntry.isFile() && vueFileName.endsWith('.vue');
        if (!isVueFile) return [];

        const vueFilePath = path.join(projSubdir, dirEntry.name);
        const fileContent = fs.readFileSync(vueFilePath).toString();
        const maybeStoryName = getStoryProp(fileContent, 'story-name');
        const maybeStoryTitle = getStoryProp(fileContent, 'story-title');
        const postSrcPath = vueFilePath.split('/src/')[1];
        const pathParts = postSrcPath.split('/');
        let storyBaseName = pathParts[pathParts.length-2];

        storyBaseName = _.camelCase(storyBaseName);
        storyBaseName = maybeStoryName || storyBaseName;

        let generatedStoryVueFile = `${storyBaseName}.vue`;
        const vueImportName = `~/${postSrcPath}`;
        const storyTitle = maybeStoryTitle? maybeStoryTitle : storyBaseName;

        return [
          { generatedStoryVueFile, storyBaseName, vueImportName, storyTitle }
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
