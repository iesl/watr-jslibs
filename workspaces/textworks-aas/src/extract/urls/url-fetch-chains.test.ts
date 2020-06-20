
import "chai/register-should";

import _  from "lodash";
import { prettyPrint } from 'commons';
import { parseLogLine } from './url-fetch-chains';
import * as Tree from 'fp-ts/lib/Tree';
import * as Arr from 'fp-ts/lib/Array';

describe("Url Parsing from scrapy spidering logs", () => {

  it("should parse url fetch/response from scrapy spider logs", () => {
    const examples = [
      ["2020-05-26 16:40:32 [protego] DEBUG: Rule at line 84 without any user agent to enforce it on.", "TODO"],
      ["2020-05-26 16:40:32 [scrapy.core.engine] DEBUG: Crawled (200) <GET http://proceedings.mlr.press/v97/li19i.html> (referer: None) ['cached']", "TODO"],
      ["2020-05-26 16:40:32 [scrapy.core.engine] DEBUG: Crawled (200) <GET http://hdl.handle.net/robots.txt> (referer: None) ['cached']", "TODO"],
      ["2020-05-26 16:40:32 [protego] DEBUG: Malformed rule at line 3 : cannot set request rate using '1/1'. Ignoring this rule.", "TODO"],
      ["2020-05-26 16:40:39 [scrapy.downloadermiddlewares.redirect] DEBUG: Redirecting (302) to <GET http://aclweb.org/anthology/D17-1063> from <GET https://doi.org/10.18653/v1/d17-1063>", "TODO"],
      ["2020-05-26 16:40:41 [scrapy.downloadermiddlewares.redirect] DEBUG: Redirecting (301) to <GET https://arxiv.org/abs/1902.08918> from <GET http://arxiv.org/abs/1902.08918>", "TODO"],
      ["2020-05-26 22:52:45 [scrapy.downloadermiddlewares.redirect] DEBUG: Redirecting (302) to <GET https://dl.acm.org/action/cookieAbsent> from <GET https://dl.acm.org/citation.cfm?id=1577077&cookieSet=1>", "TODO"],
      ["2020-05-26 22:52:50 [scrapy.downloadermiddlewares.redirect] DEBUG: Redirecting (302) to <GET http://portal.acm.org/citation.cfm?doid=347090.347105> from <GET https://doi.org/10.1145/347090.347105>", "TODO"],
      ["2020-05-26 22:52:45 [scrapy.downloadermiddlewares.robotstxt] DEBUG: Forbidden by robots.txt: <GET https://dl.acm.org/action/cookieAbsent>", "TODO"],
    ];

    _.each(examples, example => {
      const [logLine, expected] = example;

      const parsedLines = parseLogLine(logLine);
      prettyPrint({ logLine, parsedLines });
    });
  });

});
