//
import "chai/register-should";

import _ from "lodash";
import fs from "fs-extra";
import path from "path";
import * as cheerio from "cheerio";

import { prettyPrint } from "commons";
import { makeCssTreeNormalFormFromNode } from './reshape-html';

describe("Normalize htmls", () => {
  const testDirPath = './test/resources/htmls';

  it.only("smokescreen", () => {
    const htmlFile = path.resolve(testDirPath, 'nospace.html');
    const htmlFileContent = fs.readFileSync(htmlFile);

    const $ = cheerio.load(htmlFileContent);
    const root: Cheerio = $(":root");
    const normalForm = makeCssTreeNormalFormFromNode(root);
    const abIndex = normalForm.findIndex(l => /article__body/.test(l));
    const lines = normalForm.slice(abIndex-5, abIndex+20);
    prettyPrint({ htmlFile, lines });
  });
});
