import 'chai/register-should';

import _ from 'lodash';
import { prettyPrint } from '~/util/pretty-print';
import { directoryStreamDepthFirst } from '~/corpora/file-corpus';
import through from 'through2';

describe('File corpus operations',  () => {
  const testDirPath = './test/resources/test-dirs';

  it("should traverse all directories using readable stream", async (done) => {

    const dirStream = directoryStreamDepthFirst(testDirPath);

    dirStream.pipe(through.obj(
      (chunk: string, _enc: string, next: (err: any, v: any) => void) => {
        prettyPrint({ chunk });
        next(null, chunk);
      },
      (end) => {
        done();
        end();
      }
    ));
  });
});
