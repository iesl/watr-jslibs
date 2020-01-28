
import _ from 'lodash';
import fs from 'fs-extra';
import path from 'path';
import * as cheerio from 'cheerio';
import { Field, ExtractError } from '~/extract/field-extract';
import { prettyPrint } from '~/util/pretty-print';
import { walkFileCorpus, CorpusEntry } from '~/corpora/file-corpus';
import { makeCssTreeNormalForm, makeCssTreeNormalFormFromNode } from './reshape-html';
import { readFile, indentLevel, findIndexForLines, findSubContentAtIndex, filterText, stripMargin } from '~/extract/field-extract-utils';


export async function extractAbstractFromHtmls(corpusRoot: string) {
  return walkFileCorpus(corpusRoot, (entry: CorpusEntry) => {
    const htmlFile = path.join(entry.path, 'download.html');
    const metaFile = path.join(entry.path, 'entry-meta.json');
    extractAbstract(htmlFile);
  }).then(() => {
    console.log('done walking');
  });
}

type PipelineFunction = (lines: string[], content: string) => Field;
export const AbstractPipeline: PipelineFunction[] = [
  findAbstractV1,
  findAbstractV2,
  findAbstractV3,
  findAbstractV4,
  findAbstractV5,
  findAbstractV6,
  findAbstractV7,
  findAbstractV8,
];

export function extractAbstract(htmlFile: string): Field[] | ExtractError {
  console.log(`extracting ${htmlFile}`);

  const fileContent = readFile(htmlFile);

  if (!fileContent) {
    return { msg: 'file could not be read' };
  }

  if (fileContent.length === 0) {
    return {msg: 'file is empty' };
  }

  const cssNormalForm = makeCssTreeNormalForm(fileContent);
  const fields = _.map(AbstractPipeline, pf => {
    return pf(cssNormalForm, fileContent);
  });
  const abstractFields = fields.filter(f => f.value);

  const dir = path.dirname(htmlFile);
  const cssNormFile = path.join(dir, 'css-norm.txt');
  if (fs.existsSync(cssNormFile)) {
    fs.removeSync(cssNormFile);
  }
  const cssNormContent = _.join(cssNormalForm, '\n');
  fs.writeFileSync(cssNormFile, cssNormContent);

  if (abstractFields.length>0) {
    console.log(`found abstracts: ${htmlFile}`)
    _.each(abstractFields, field => {
      const ev = field.evidence;
      const vl = field.value!;
      console.log(`  > ${vl}`)
      console.log(`  using: ${ev}`)
    });
  } else {
    console.log(`no abstract: ${htmlFile}`)
  }

  return abstractFields;
}



export function findAbstractV1(cssNormLines: string[]): Field {
  let field: Field = {
    name: 'abstract',
    evidence: 'css-norm.match(#abstract")',
  };

  cssNormLines.findIndex((line, lineNum) => {
    if (line.match('div #abstract')) {
      const lineIndent = indentLevel(line);
      let nextLineNum = lineNum+1;
      let nextLine = cssNormLines[nextLineNum]
      while (nextLine && indentLevel(nextLine) > lineIndent) {
        nextLine = cssNormLines[nextLineNum++];
      }

      const indentedLines = cssNormLines.slice(lineNum, lineNum+nextLineNum);
      const probAbsract = _.map(indentedLines, _.trim)
        .filter(l => l.startsWith('|'))
        .map(l => l.substr(1))
      ;

      const abst = _.join(probAbsract, ' ');
      // const abst = cssNormLines[lineNum+1];
      field.value = abst;
    }
  });

  return field;
}

export function findAbstractV2(cssNormLines: string[]): Field {
  let field: Field = {
    name: 'abstract',
    evidence: 'css-norm.match(global.document.metadata)',
  };
  cssNormLines.findIndex((line) => {
    if (line.match('global.document.metadata')) {
      const jsonStart = line.indexOf('{');
      const jsonEnd = line.lastIndexOf('}');
      const lineJson = line.slice(jsonStart, jsonEnd+1);
      try {
        const metadataObj = JSON.parse(lineJson);
        const abst = metadataObj['abstract'];
        field.value = abst;
        // prettyPrint({ abst, metadataObj });
      } catch (e) {
        prettyPrint({ e, lineJson });
      }
    }
  });
  return field;
}


export function findAbstractV3(cssNormLines: string[]): Field {
  let evidence = ['section.*\.Abstract', 'h2.*\.Heading', 'Abstract'];
  let field: Field = {
    name: 'abstract',
    evidence: _.join(evidence, ' > '),
  };
  const index = findIndexForLines(cssNormLines, evidence);
  if (index > -1) {
    const sub = findSubContentAtIndex(cssNormLines, index);
    const justText = filterText(sub);
    // prettyPrint({ index, sub, justText  });
    field.value = _.join(justText, ' ');
  }
  return field;
}




export function findAbstractV4(cssNormLines: string[]): Field {
  let evidence = ['.hlFld-Abstract', 'div'];
  let field: Field = {
    name: 'abstract',
    evidence: _.join(evidence, ' > '),
  };
  const index = findIndexForLines(cssNormLines, evidence);
  if (index > -1) {
    const sub = findSubContentAtIndex(cssNormLines, index);
    const justText = filterText(sub);
    field.value = _.join(justText, ' ');
  }
  return field;
}

export function findAbstractV5(cssNormLines: string[]): Field {
  let evidence = ['div', 'h3.*\.label', 'Abstract'];
  let field: Field = {
    name: 'abstract',
    evidence: _.join(evidence, ' > '),
  };
  const index = findIndexForLines(cssNormLines, evidence);
  if (index > -1) {
    const sub = findSubContentAtIndex(cssNormLines, index);
    const justText = filterText(sub);
    field.value = _.join(justText, ' ');
  }
  return field;
}

export function findAbstractV6(cssNormLines: string[]): Field {
  let evidence = ['div.*#abstract', 'h4', 'Abstract'];
  let evidenceEnd = ['div.*#paperSubject', 'h4', 'Keywords'];

  let field: Field = {
    name: 'abstract',
    evidence: _.join(evidence, ' > '),
  };

  const index = findIndexForLines(cssNormLines, evidence);

  if (index > -1) {
    const endIndex = findIndexForLines(cssNormLines, evidenceEnd);
    if (endIndex > -1) {
      const window = cssNormLines.slice(index, endIndex);
      const sub = findSubContentAtIndex(window, 0);
      const justText = filterText(sub);
      field.value = _.join(justText, ' ');
    }
  }
  return field;
}

export function findAbstractV7(cssNormLines: string[], fileContent: string): Field {
  let field: Field = {
    name: 'abstract',
    evidence: '??',
  };

  const $ = cheerio.load(fileContent);

  const maybeAbstract = $('section#main .card-title');
  const abstrParent = maybeAbstract.parents()[0];

  const cssNormalParent = makeCssTreeNormalFormFromNode($(abstrParent));
  prettyPrint({ cssNormalParent } );
  const justText = filterText(cssNormalParent);
  field.value = _.join(justText, ' ');

  return field;
}

export function findAbstractV8(_normLines: string[], fileContent: string): Field {
  let field: Field = {
    name: 'abstract',
    evidence: 'div.content > div > div.row > div.col-md-12',
  };

  const $ = cheerio.load(fileContent);

  const maybeAbstract = $('div.content > div > div.row > div.col-md-12');
  const cssNormal = makeCssTreeNormalFormFromNode(maybeAbstract);
  let maybeAbstr = _.takeWhile(cssNormal.slice(1), l => !l.includes('col-md-12'));
  maybeAbstr = stripMargin(maybeAbstr);
  if (maybeAbstr.length > 0) {
    prettyPrint({ maybeAbstr } );
    field.value = _.join(maybeAbstr, ' ');
  }

  return field;
}


// // TODO detect empty and badly-formed files
// function findAbstractV4(cssNormLines: string[]): Field {
//   let field: Field = {
//     name: 'abstract',
//     evidence: '//doi.org: div[:class="abstract"]/h3+p',
//   };
//   cssNormLines.findIndex((line, lineNum) => {
//     const l1 = cssNormLines[lineNum+1];
//     const l2 = cssNormLines[lineNum+2];
//     if (line.match('"item abstract"') && l1.match('Abstract') && l2.match('<p>')) {
//       const begin = l2.indexOf('<p>')
//       const end = l2.lastIndexOf('</p>')
//       const abst = line.slice(begin, end);
//       field.value = abst;
//     }
//   });
//   //<div class="item abstract">
//   //  <h3 class="label">Abstract</h3>
//   //  <p>This paper proposes a no... </p>
//   //</div>
//   return field;
// }
