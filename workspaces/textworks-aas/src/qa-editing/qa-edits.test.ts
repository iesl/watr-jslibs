import "chai/register-should";

import _ from "lodash";
import { prettyPrint } from '~/util/pretty-print';
import { matchAll, highlightStringRegions } from '~/util/utils';


describe("Q/A Editing", () => {
  it("should apply cleaning rules", () => {

    const input = "some random string";

    const re = /om/g;
    const matches = matchAll(re, input);

    const result = highlightStringRegions(input, matches);

    console.log(result);
  });
});
