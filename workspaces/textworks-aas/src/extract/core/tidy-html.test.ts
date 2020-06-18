import "chai/register-should";

import _ from "lodash";
import fs from "fs-extra";
import path from "path";

import { prettyPrint, throughFunc, streamPump } from "commons";
import { transformViaTidy, getFileType, transformViaTidyBuffered } from './tidy-html';

describe("use Html5 Tidy to re-write htmls", () => {
  const testDirPath = './test/resources/htmls';
  const configFile = './conf/tidy.cfg';

  it("smokescreen", async (done) => {
    const htmlFile = path.resolve(testDirPath, 'nospace.html');

    const { outStream, completePromise } =
      transformViaTidy(configFile, htmlFile);

    const lines: string[] = [];

    outStream
      .pipe(throughFunc(
        (line: string, _onerr?: (e: any) => void) => {
          lines.push(line);
        }))
      .on('data', () => undefined);

    await completePromise;

    const head = lines.slice(0, 10);
    prettyPrint({ msg: 'tidied file', head });

    done();

  });
  it("should get file types using linux file cmd", async (done) => {
    const htmlFile = path.resolve(testDirPath, 'nospace.html');

    const fileType = await getFileType(htmlFile);
    prettyPrint({ fileType });
    done();
  });

  it("should handle process err output", async (done) => {
    const htmlFile = path.resolve(testDirPath, 'nospace.html');

    const [err, out, exitCode] = await transformViaTidyBuffered(configFile, htmlFile);
    const err4 = err.slice(0, 4);
    const out4 = out.slice(0, 4);

    prettyPrint({ err4, out4, exitCode });

    done();

  });

});
