import "chai";

import { matchAll, highlightRegions, clipParagraph } from './string-utils';

describe("String utils", () => {

  it("should apply cleaning and hightlight", () => {

    const input = "some random string";

    let matches = matchAll(/om/g, input);
    let result = highlightRegions(input, matches);
    console.log(result);

    // matches = matchAll(/o../g, input);
    // result = highlightRegions(result, matches)
    // console.log(result);

    matches = matchAll(/n.*n/g, input);
    result = highlightRegions(result, matches)
    console.log(result);


  });
  it.only("clip paragraphs", () => {
    const p = "ab cd ef gh ij"
    // const p = ""
    const result = clipParagraph(3, 2, p);

    console.log(result);
  });
});
