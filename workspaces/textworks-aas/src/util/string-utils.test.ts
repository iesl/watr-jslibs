import "chai/register-should";

import _ from "lodash";
import { matchAll, highlightRegions } from './string-utils';


describe("String utils", () => {

  it.only("should apply cleaning and hightlight", () => {

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
});
