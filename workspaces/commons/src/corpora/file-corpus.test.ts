import 'chai/register-should';

import _ from 'lodash';
import through from 'through2';
import { dirsteam } from './dirstream';
import { prettyPrint } from '~/util/pretty-print';

describe('File corpus operations',  () => {
  const testDirPath = './test/resources/test-dirs';

  it("should traverse all directories using readable stream", async (done) => {

    const dirStream = dirsteam(testDirPath);

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


  it("should construct suitable corpus paths from urls", () => {
    // const url = 'http://www.some.org/extra/path?k=v&k2=v2';

  });

  // import { promptForAction2 } from '~/spider/spidering';
  // it.only("quick test ui code....", async (done) => {
  //   jest.setTimeout(40000);
  //   const res = await promptForAction2('some/url/');
  //   prettyPrint({ res });
  //   done();
  // });
});
