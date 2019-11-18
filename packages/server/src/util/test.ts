// Try out refactorings...
import _ from 'lodash';

import { Project } from "ts-morph";

const project = new Project({
    tsConfigFilePath: "~/../../ui-components/tsconfig.json"
});

const srcFiles = project.getSourceFiles()
const names = _.map(srcFiles, s => s.getBaseName())
console.log('src', names);
