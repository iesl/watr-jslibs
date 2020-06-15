//
import fs, { PathLike } from "fs-extra";
import path from "path";
import _ from "lodash";
import { prettyPrint } from "commons";
import { cheerioLoad } from './field-extract-utils';
import { promisify } from 'bluebird';

type Attrs = { [k: string]: string };

function parseAttrs(attrs: Attrs): string[][] {
  const keys = _.keys(attrs);

  const kvs: string[][] = [];
  const stdKeys = [
    ["id", "#"],
    ["class", "."],
    ["href", "href"],
    ["src", "src"],
    ["name", "@"],
    ["lang", "lang"],
    ["xml:lang", "xml:lang"],
    ["property", "prop"],
  ];
  _.each(stdKeys, ([k, abbr]) => {
    const v = attrs[k];
    if (v) {
      if (v.includes(" ")) {
        const words = v
          .split(" ")
          .map(_.trim)
          .filter(_.negate(_.isEmpty));

        _.each(words, w => {
          kvs.push([k, w, abbr]);
        });

      } else if (_.isArray(v)) {
        _.each(v, v0 => {
          kvs.push([k, v0, abbr]);
        });
      } else {
        kvs.push([k, v, abbr]);
      }
    }
  });
  const otherKeys = keys.filter(ok => !_.some(stdKeys, ([k]) => k === ok));
  const sorted = _.sortBy(otherKeys);
  _.each(sorted, k => {
    const v = attrs[k];
    if (v) {
      kvs.push([k, v, k]);
    }
  });

  return kvs;
}

function indentStrings(strs: string[], lpad: string | number): string[] {
  let p = lpad;
  if (typeof lpad === "number") {
    p = "".padStart(lpad);
  }
  return _.map(strs, str => p + str);
}


export function makeCssTreeNormalFormFromNode(root: Cheerio): string[] {
  const finalTree: string[] = [];

  _.each(_.range(root.length), rootIndex => {
    const elem = root[rootIndex];

    mapHtmlTree(elem, (node: CheerioElement, depth, _index, _sibcount) => {
      const tn = node.tagName;
      const tp = node["type"];

      const lpad = "".padStart(depth * 2);
      const attrs = node.attribs;
      let attrsStr = "";
      if (attrs) {
        // let verbose = false;
        // if (depth > 8 && depth < 12 ) {
        //   verbose = true;
        //   prettyPrint({ tn, tp, attrs, depth });
        // }
        const attrPairs = parseAttrs(attrs);

        // if (depth > 8 && depth < 12 ) {
        //   prettyPrint({ attrPairs });
        // }

        const attrstr0 = _.map(attrPairs, ([_k, v, abbr]) => {
          if (abbr.length === 1) {
            return `${abbr}${v}`;
          }
          return `${abbr}='${v}'`;
        });
        attrsStr = _.join(attrstr0, " ");
      }

      // prettyPrint({ depth, tn, tp, attrs });

      switch (tp) {
        case "tag": {
          const line = `${lpad}${tn} ${attrsStr}`;
          finalTree.push(line);
          break;
        }

        case "text": {
          const d = node.data ? node.data.trim() : undefined;
          if (d && d.length > 0) {
            const lines = d.split("\n");
            const indentedLines = indentStrings(
              indentStrings(lines, "| "),
              depth * 2,
            );
            _.each(indentedLines, l => finalTree.push(l));
          }
          break;
        }

        case "comment": {
          const line = `${lpad}comment`;
          finalTree.push(line);
          const d = node.data ? node.data.trim() : undefined;
          if (d && d.length > 0) {
            const lines = d.split("\n");
            const indentedLines = indentStrings(
              indentStrings(lines, "## "),
              (depth + 1) * 2,
            );
            _.each(indentedLines, l => finalTree.push(l));
          }
          break;
        }

        default: {
          const line = `${lpad}${tn}[${tp}] ${attrsStr}`;
          finalTree.push(line);
        }
      }
    });
  });

  return finalTree;
}

export function makeCssTreeNormalForm(htmlFile: string, useXmlMode: boolean = true): string[] {
  const $ = cheerioLoad(htmlFile, useXmlMode);
  const root: Cheerio = $(":root");
  return makeCssTreeNormalFormFromNode(root);
}

function mapHtmlTree(
  rootElem: CheerioElement,
  f: (
    node: CheerioElement,
    depth: number,
    index: number,
    siblings: number,
  ) => any,
) {
  function _inner(
    elem: CheerioElement,
    dpt: number,
    idx: number,
    sibs: number,
  ) {
    f(elem, dpt, idx, sibs);
    const childs = elem.children;
    // // dbg
    // const tn = elem.tagName;
    // const tp = elem["type"];
    // const ccs = _.map(childs, c => {
    //   const tn = c.tagName;
    //   const tp = c["type"];
    //   return `${tn}::${tp}`;
    // });
    // const ccsstr = _.join(ccs, " ; ");
    // const xxxstr = `${dpt}. ${tn}:${tp}  >>  ${ccsstr}`;
    // console.log('mapHtmlTree', xxxstr);

    if (childs) {
      const chsibs = childs.length;
      const chdpt = dpt + 1;
      _.each(childs, (child, chidx) => {
        _inner(child, chdpt, chidx, chsibs);
      });
    }
  }
  _inner(rootElem, 0, 0, 1);
}


export async function withCachedFile(
  cacheDirectory: string,
  cacheFilename: string,
  fn: () => Promise<string>
): Promise<string> {

  const maybeCached = await readResolveFileAsync(cacheDirectory, cacheFilename);
  if (maybeCached) {
    return maybeCached;
  }

  const content = await fn();

  const cachedPath = path.join(cacheDirectory, cacheFilename);
  await fs.writeFile(cachedPath, content, {});
  return content;
}

export function writeNormalizedHtml(htmlFile: string): void {
  const cssNormFilename = `${htmlFile}.norm.txt`;
  if (fs.existsSync(cssNormFilename)) {
    console.log(`css.norm.txt already exists`);
    return;
  }

  const fileContent = readResolveFile(htmlFile);

  if (!fileContent) {
    prettyPrint({ msg: "file could not be read" });
    return;
  }

  if (fileContent.length === 0) {
    prettyPrint({ msg: "file is empty" });
    return;
  }

  const cssNormalForm = makeCssTreeNormalForm(fileContent);
  const cssNormal = _.join(cssNormalForm, "\n");
  fs.writeFileSync(`${htmlFile}.norm.txt`, cssNormal);
}

const readFileAsync = promisify<Buffer, string>(fs.readFile)

export async function readResolveFileAsync(leading: string, ...more: string[]): Promise<string | undefined> {
  const filepath = path.join(leading, ...more);

  const exists = fs.existsSync(filepath);

  if (exists) {
    return readFileAsync(filepath)
      .then(content => content.toString());
  }
  return undefined;
}

export function readResolveFile(leading: string, ...more: string[]): string | undefined {
  const filepath = path.join(leading, ...more);
  const exists = fs.existsSync(filepath);
  if (exists) {
    const buf = fs.readFileSync(filepath);
    const fileContent = buf.toString().trim();
    return fileContent;
  }
  return undefined;
}
