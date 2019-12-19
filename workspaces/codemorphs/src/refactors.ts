import _ from 'lodash';
import * as path from "path";

import { Project } from "ts-morph";

export function listSrcFiles() {
  const project = new Project({
    tsConfigFilePath: "~/../../ui-components/tsconfig.json"
  });

  const srcFiles = project.getSourceFiles()
  const names = _.map(srcFiles, s => s.getBaseName())
  console.log('src', names);
}


export function organizeImports(tsconfigPath: string, componentName: string, rootPath: string) {
  const project = new Project({
    tsConfigFilePath: tsconfigPath
  });

  const sourceFile = project.getSourceFile(componentName);

  console.log(`organizing imports for ${sourceFile?.getBaseName()}`);
  const preText = sourceFile?.getText();
  sourceFile?.organizeImports();
  const afterText = sourceFile?.getText();

  console.log('pre\n', preText);
  console.log('post\n', afterText);


}

export function setupVueComponent(tsconfigPath: string, componentName: string, rootPath: string) {

  const project = new Project({
    tsConfigFilePath: tsconfigPath,
  });

  console.log(`vue component setup for component ${componentName} in root path=${rootPath}`);
  const baseUrl = project.getCompilerOptions().baseUrl!;

  const at = (fname: string) => {
    const p = path.join(baseUrl, rootPath, componentName, fname)
    return p;
  }

  const vueFile = at('index.vue');
  _.capitalize()
  const nameParts = componentName.split('-');
  const capParts = _.map(nameParts, _.capitalize);
  const title = _.join(capParts, ' ');

  const vueContent = `<template lang="html" src="./${componentName}.html"></template>
<script lang="ts" src="./${componentName}.ts">
// story-name=${_.camelCase(componentName)}
// story-title=${title}
</script>
<style lang="scss" src="./${componentName}.scss" scoped></style>
`;

  const vueSourceFile = project.createSourceFile(vueFile, vueContent).saveSync();
  const tsSource = project.createSourceFile(at(`${componentName}.ts`), '// TODO \n').saveSync();
  const htmlSource = project.createSourceFile(at(`${componentName}.html`), '<div> TODO </div>\n').saveSync();
  const styleSource = project.createSourceFile(at(`${componentName}.scss`), '.todo {}\n').saveSync();

}
