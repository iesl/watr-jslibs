import _ from "lodash";
import path from "path";
import pump from "pump";
import {Transform} from "stream";
import through from "through2";

import fs from "fs-extra";
import * as cheerio from "cheerio";
import {Field} from "~/extract/field-extract";
import {prettyPrint} from "~/util/pretty-print";

import {makeCssTreeNormalFormFromNode} from "./reshape-html";

import {
  readFile,
  indentLevel,
  findIndexForLines,
  findSubContentAtIndex,
  filterText,
  stripMargin,
} from "~/extract/field-extract-utils";

import {
  newCorpusEntryStream,
  expandDirTrans,
  ExpandedDir,
} from "~/corpora/corpus-browser";

import {tapStream} from "~/util/stream-utils";

export function extractAbstractTransform(): Transform {
  return through.obj(
    (exDir: ExpandedDir, _enc: string, next: (err: any, v: any) => void) => {
      try {
        extractAbstract(exDir);
      } catch (err) {
        console.log(`err ${err}`);
      }
      next(null, exDir);
    },
  );
}

export async function extractAbstractFromHtmls(corpusRoot: string) {
  const entryStream = newCorpusEntryStream(corpusRoot);
  const pipe = pump(
    entryStream,
    tapStream((d, i) => {
      console.log(`${i}: ${d}`);
    }),
    expandDirTrans,
    extractAbstractTransform(),
    (err?: Error) => {
      if (err) {
        console.log(`Error:`, err);
      } else {
        console.log(`Done.`);
      }
    },
  );

  pipe.on("data", () => {});
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
  findAbstractV9,
  findAbstractV10,
];

export function extractAbstract(exDir: ExpandedDir): void {
  const htmlFiles = exDir.files
    .filter(f => f.endsWith(".html"))
    .map(f => path.resolve(exDir.dir, f));

  _.each(htmlFiles, htmlFile => {
    const extrAbsFilename = `${htmlFile}.ex.abs.json`;

    if (fs.existsSync(extrAbsFilename)) {
      console.log(
        `skipping: abstracts file already exists: ${extrAbsFilename}`,
      );
      return;
    }
    console.log(`extracting abstract from ${htmlFile}`);

    const cssNormFile = `${htmlFile}.norm.txt`;

    const htmlContent = readFile(htmlFile);
    const normFileContent = readFile(cssNormFile);

    if (!(htmlContent && normFileContent)) {
      console.log(`.html and .norm.txt did not exist in ${exDir}`);
      return;
    }

    const cssNormalForm = normFileContent.split("\n");
    const fields = _.map(AbstractPipeline, pf => {
      return pf(cssNormalForm, htmlContent);
    });

    const abstractFields: Field[] = fields.filter(f => f.value);

    const writeAbstracts = true;

    if (writeAbstracts) {
      if (abstractFields.length > 0) {
        console.log(
          `writing ${abstractFields.length} abstracts to ${extrAbsFilename}`,
        );
        fs.writeJsonSync(extrAbsFilename, abstractFields);
      } else {
        console.log(`no abstracts: ${htmlFile}`);
      }
    }
    return;
  });
}

export function findAbstractV1(cssNormLines: string[]): Field {
  let field: Field = {
    name: "abstract",
    evidence: 'css-norm.match(#abstract")',
  };

  cssNormLines.findIndex((line, lineNum) => {
    if (line.match("div #abstract")) {
      const lineIndent = indentLevel(line);
      let nextLineNum = lineNum + 1;
      let nextLine = cssNormLines[nextLineNum];
      while (nextLine && indentLevel(nextLine) > lineIndent) {
        nextLine = cssNormLines[nextLineNum++];
      }

      const indentedLines = cssNormLines.slice(lineNum, lineNum + nextLineNum);
      const probAbsract = _.map(indentedLines, _.trim)
        .filter(l => l.startsWith("|"))
        .map(l => l.substr(1));

      const abst = _.join(probAbsract, " ");
      // const abst = cssNormLines[lineNum+1];
      field.value = abst;
    }
  });

  return field;
}

export function findAbstractV2(cssNormLines: string[]): Field {
  let field: Field = {
    name: "abstract",
    evidence: "css-norm.match(global.document.metadata)",
  };
  cssNormLines.findIndex(line => {
    if (line.match("global.document.metadata")) {
      const jsonStart = line.indexOf("{");
      const jsonEnd = line.lastIndexOf("}");
      const lineJson = line.slice(jsonStart, jsonEnd + 1);
      try {
        const metadataObj = JSON.parse(lineJson);
        const abst = metadataObj["abstract"];
        field.value = abst;
        // prettyPrint({ abst, metadataObj });
      } catch (e) {
        prettyPrint({e, lineJson});
      }
    }
  });
  return field;
}

export function findAbstractV3(cssNormLines: string[]): Field {
  let evidence = ["section.*.Abstract", "h2.*.Heading", "Abstract"];
  let field: Field = {
    name: "abstract",
    evidence: _.join(evidence, " > "),
  };
  const index = findIndexForLines(cssNormLines, evidence);
  if (index > -1) {
    const sub = findSubContentAtIndex(cssNormLines, index);
    const justText = filterText(sub);
    // prettyPrint({ index, sub, justText  });
    field.value = _.join(justText, " ");
  }
  return field;
}

export function findAbstractV4(cssNormLines: string[]): Field {
  let evidence = [".hlFld-Abstract", "div"];
  let field: Field = {
    name: "abstract",
    evidence: _.join(evidence, " > "),
  };
  const index = findIndexForLines(cssNormLines, evidence);
  if (index > -1) {
    const sub = findSubContentAtIndex(cssNormLines, index);
    const justText = filterText(sub);
    field.value = _.join(justText, " ");
  }
  return field;
}

export function findAbstractV5(cssNormLines: string[]): Field {
  let evidence = ["div", "h3.*.label", "Abstract"];
  let field: Field = {
    name: "abstract",
    evidence: _.join(evidence, " > "),
  };
  const index = findIndexForLines(cssNormLines, evidence);
  if (index > -1) {
    const sub = findSubContentAtIndex(cssNormLines, index);
    const justText = filterText(sub);
    field.value = _.join(justText, " ");
  }
  return field;
}

export function findAbstractV6(cssNormLines: string[]): Field {
  let evidence = ["div.*#abstract", "h4", "Abstract"];
  let evidenceEnd = ["div.*#paperSubject", "h4", "Keywords"];

  let field: Field = {
    name: "abstract",
    evidence: _.join(evidence, " > "),
  };

  const index = findIndexForLines(cssNormLines, evidence);

  if (index > -1) {
    const endIndex = findIndexForLines(cssNormLines, evidenceEnd);
    if (endIndex > -1) {
      const window = cssNormLines.slice(index, endIndex);
      const sub = findSubContentAtIndex(window, 0);
      const justText = filterText(sub);
      field.value = _.join(justText, " ");
    }
  }
  return field;
}

export function findAbstractV7(
  _cssNormLines: string[],
  fileContent: string,
): Field {
  let field: Field = {
    name: "abstract",
    evidence: "??",
  };

  const $ = cheerio.load(fileContent);

  const maybeAbstract = $("section#main .card-title");
  const abstrParent = maybeAbstract.parents()[0];

  const cssNormalParent = makeCssTreeNormalFormFromNode($(abstrParent));
  // prettyPrint({ cssNormalParent } );
  const justText = filterText(cssNormalParent);
  field.value = _.join(justText, " ");

  return field;
}

export function findAbstractV8(
  _normLines: string[],
  fileContent: string,
): Field {
  let field: Field = {
    name: "abstract",
    evidence: "div.content > div > div.row > div.col-md-12",
  };

  const $ = cheerio.load(fileContent);

  const maybeAbstract = $("div.content > div > div.row > div.col-md-12");
  const cssNormal = makeCssTreeNormalFormFromNode(maybeAbstract);
  let maybeAbstr = _.takeWhile(
    cssNormal.slice(1),
    l => !l.includes("col-md-12"),
  );
  maybeAbstr = stripMargin(maybeAbstr);
  if (maybeAbstr.length > 0) {
    // prettyPrint({ maybeAbstr } );
    field.value = _.join(maybeAbstr, " ");
  }

  return field;
}

export function findAbstractV9(
  _normLines: string[],
  fileContent: string,
): Field {
  let field: Field = {
    name: "abstract",
    evidence: "div#body > div#main > div#content > div#abstract",
  };

  const $ = cheerio.load(fileContent);

  const maybeAbstract = $("div#body > div#main > div#content > div#abstract");
  const cssNormal = makeCssTreeNormalFormFromNode(maybeAbstract);
  const justText = filterText(cssNormal);
  const abs = _.join(justText, " ").trim();

  if (abs.length > 0) {
    field.value = abs;
  }

  return field;
}

export function findAbstractV10(
  _normLines: string[],
  fileContent: string,
): Field {
  let field: Field = {
    name: "abstract",
    evidence: "div#body > div#main > div#content > div#abstract",
  };

  const $ = cheerio.load(fileContent);

  const maybeAbstract = $("div#Abs1-content > p");
  const cssNormal = makeCssTreeNormalFormFromNode(maybeAbstract);
  const justText = filterText(cssNormal);
  const abs = _.join(justText, " ").trim();

  if (abs.length > 0) {
    field.value = abs;
  }

  return field;
}
//  div .c-article-body data-article-body='true' data-track-component='article body'
//     section aria-labelledby='Abs1' lang='en'
//       div #Abs1-section .c-article-section
//         h2 #Abs1
//           | Abstract
//         div #Abs1-content .c-article-section__content
//           p
//             | An approach is presented to match imaged trajectories of anatomical landmarks (e.g. hands, shoulders and feet) using semantic correspondences between human bodies. These correspondences are used to provide geometric constraints for matching actions observed
