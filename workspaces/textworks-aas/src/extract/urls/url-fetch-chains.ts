import _ from "lodash";

import {
  createReadLineStream,
  streamPump,
  isDefined,
  prettyPrint,
  makeTreeFromPairs,
  Edges,
} from "commons";

export interface UrlChainLink {
  requestUrl: string;
  responseUrl?: string;
  status: string;
  timestamp: string;
}
import * as Tree from 'fp-ts/lib/Tree';
import { all } from 'bluebird';

export interface InboundUrlChain {
  chains: UrlChainLink[];
}

// type UrlAndCode = [string, number];
export interface UrlGraph {
  isUrlCrawled(url: string, verbose?: boolean): boolean;
  getUrlFetchChain(url: string): string[];
}

function trimGetClause(str: string): string {
  const li = str.lastIndexOf('>');
  return str.substring(5, li);
}

const getUrlRE = new RegExp('<GET ([^>]*)>([ ]|$)', 'g');

// These are the log entries we care about from scrapy
// cat crawler.log | egrep -v '\[protego\]' | egrep -v '\[scrapy\.(down|ext|core|utils|crawler|spidermiddle)'
export function parseLogLine(logline: string): UrlChainLink | string | undefined {
  const httpCodeRE = /DEBUG: (\w+) [(](\d{3})[)]/;
  const httpForbiddenByRobotsRE = /DEBUG: Forbidden by robots.txt/;
  const timestampRE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/;


  const timestampMatch = logline.match(timestampRE);
  // All lines we care about start with a timestamp, parse and validate:
  if (timestampMatch == null) return;
  const dateAsString = timestampMatch[0];
  const dateAsNum = Date.parse(dateAsString);
  if (isNaN(dateAsNum)) return;


  const httpCodeMatches = logline.match(httpCodeRE);
  const isForbiddenByRobotsTxt = httpForbiddenByRobotsRE.test(logline);

  const urlMatches = logline.match(getUrlRE);
  let [firstUrl, secondUrl] = urlMatches ? urlMatches : [undefined, undefined];
  firstUrl = firstUrl ? trimGetClause(firstUrl) : undefined;
  secondUrl = secondUrl ? trimGetClause(secondUrl) : undefined;

  if (isForbiddenByRobotsTxt) {
    if (!firstUrl) return 'Error: could not parse single url in ${logline}';
    const chainLink: UrlChainLink = {
      requestUrl: firstUrl,
      status: "Forbidden",
      timestamp: dateAsString
    };
    return chainLink;
  }

  const [, httpAction, httpStatus] = httpCodeMatches ? httpCodeMatches : [undefined, undefined, undefined];

  if (httpAction === 'Redirecting') {
    if (!firstUrl || !secondUrl) return 'Error: could not parse two urls in ${logline}';
    if (!httpStatus) return 'Error: could not parse status in ${logline}';
    const chainLink: UrlChainLink = {
      requestUrl: secondUrl,
      responseUrl: firstUrl,
      status: httpStatus,
      timestamp: dateAsString
    };
    return chainLink;
  }

  if (httpAction === 'Crawled') {
    if (!firstUrl) return 'Error: could not parse single url in ${logline}';
    if (!httpStatus) return 'Error: could not parse status in ${logline}';
    const chainLink: UrlChainLink = {
      requestUrl: firstUrl,
      status: httpStatus,
      timestamp: dateAsString
    };
    return chainLink;
  }

  return;
}

// type UrlChain = UrlChainLink[];
// type UrlChains = UrlChain[];

export async function readUrlFetchChainsFromScrapyLogs(logfile: string): Promise<UrlGraph> {
  const inputStream = createReadLineStream(logfile)

  // const urlChains =  radix.createRadix<UrlChainLink>();

  const pumpBuilder = streamPump.createPump()
    .viaStream<string>(inputStream)
    .throughF((line: string) => {
      const parsed = parseLogLine(line);
      if (_.isString(parsed)) {
        console.log('error parsing logfile line', parsed);
        return;
      }
      return parsed;
    })
    .guard(isDefined)
    .gather();

  return pumpBuilder.toPromise()
    .then((allLinks) => {
      if (!allLinks) {
        const emptyGraph: UrlGraph = {
          isUrlCrawled(_url: string, _verbose?: boolean): boolean {
            return true;
          },
          getUrlFetchChain(_url: string): string[] {
            return [];
          }
        };
        return emptyGraph;
      }

      const reqLinkNums = new Map<string, number[]>();
      // const respLinkNums = new Map<string, number[]>();

      _.each(allLinks, (link, linkNum) => {
        const { requestUrl } = link;
        const prevs0 = reqLinkNums.get(requestUrl) || [];
        prevs0.push(linkNum);
        reqLinkNums.set(requestUrl, prevs0);

        // if (!responseUrl) return;

        // const prevs1 = respLinkNums.get(responseUrl) || [];
        // prevs1.push(linkNum);
        // respLinkNums.set(responseUrl, prevs1);
      });

      const allParentChildPairs: Edges<number> = _.flatMap(allLinks, (link, linkNum) => {
        const { responseUrl } = link;
        if (!responseUrl) return [];
        const maybeNextLinks = reqLinkNums.get(responseUrl) || [];

        const downstreamLinkNums = _.filter(maybeNextLinks, n => n > linkNum);
        const downstreamParentChildPairs = _.map(downstreamLinkNums, n => [linkNum, n] as [number, number]);
        return downstreamParentChildPairs;
      });

      const chainTrees = makeTreeFromPairs(allParentChildPairs);

      _.each(chainTrees, (chainTree) => {
        const chainTreeStr = Tree.map((n: number) => {
          const linkN = allLinks[n];
          const { requestUrl, responseUrl , status } = linkN;
          return `${requestUrl} -(${status})-> ${responseUrl? responseUrl : '.'}`;
        })(chainTree);
        const asString = Tree.drawTree(chainTreeStr);
        console.log('=========\n\n');
        console.log(asString);
        console.log('\n');
      });

      const urlGraph: UrlGraph = {
        isUrlCrawled(_url: string, _verbose?: boolean): boolean {
          return true;
        },
        getUrlFetchChain(_url: string): string[] {
          return [];
        }
      };
      return urlGraph;
    });
}


// const chains: _.NumericDictionary<UrlChains> = {};
// _.each(allLinks, (link, linkNum) => {
//   const { requestUrl, responseUrl } = link;

//   _.update(
//     chains, linkNum,
//     (prevChains: UrlChains | undefined) => {

//     });

// });






// _.each(allLinks, (link, linkNum) => {
//   const { requestUrl, responseUrl } = link;
//   if (!responseUrl) return;
//   const maybeNextLinks = reqUrlLinkIndexes[responseUrl] || [];
//   _(maybeNextLinks)
//     .filter(n => n > linkNum)
//     .map(n => [link, allLinks[n]])
//   const laterLinks = _.filter(maybeNextLinks, n => n > linkNum);
// });

  // return pumpBuilder.toPromise()
  //   .then((allLinks) => {
  //     if (!allLinks) {
  //       const emptyGraph: UrlGraph = {
  //         isUrlCrawled(_url: string, _verbose?: boolean): boolean {
  //           return true;
  //         },
  //         getUrlFetchChain(_url: string): string[] {
  //           return [];
  //         }
  //       };
  //       return emptyGraph;
  //     }

  //     const reqUrlLinkIndexes: _.Dictionary<number[]> = {};
  //     const respUrlLinkIndexes: _.Dictionary<number[]> = {};

  //     _.each(allLinks, (link, linkNum) => {
  //       const { requestUrl, responseUrl } = link;
  //       let prev = reqUrlLinkIndexes[requestUrl];
  //       if (prev) {
  //         prev.push(linkNum);
  //       } else {
  //         reqUrlLinkIndexes[requestUrl] = [linkNum];
  //       }

  //       if (!responseUrl) return;
  //       prev = respUrlLinkIndexes[responseUrl];
  //       if (prev) {
  //         prev.push(linkNum);
  //       } else {
  //         respUrlLinkIndexes[responseUrl] = [linkNum];
  //       }
  //     });

  //     const chains: _.NumericDictionary<UrlChains> = {};
  //     _.each(allLinks, (link, linkNum) => {
  //       const { requestUrl, responseUrl } = link;

  //       if (!responseUrl) return;

  //       const currDSChain = chains[linkNum] || [];

  //       const maybeNextLinks = reqUrlLinkIndexes[responseUrl] || [];

  //       const downstreamLinkNums = _.filter(maybeNextLinks, n => n > linkNum);
  //       const downstreamLinks = _.map(downstreamLinkNums, n => allLinks[n]);
  //       const linkChain = [link, ...downstreamLinks];

  //       _.each(downstreamLinkNums, dsLinkNum => {
  //         const dsChain = chains[dsLinkNum] || [];
  //         dsChain.push(linkChain)
  //         // chains[dsLinkNum] = [ linkChain ];
  //       });
  //       // prettyPrint({ reqUrlLinkIndexes, respUrlLinkIndexes });
  //     });

  //     prettyPrint({ chains });


  //     const urlGraph: UrlGraph = {
  //       isUrlCrawled(_url: string, _verbose?: boolean): boolean {
  //         return true;
  //       },
  //       getUrlFetchChain(_url: string): string[] {
  //         return [];
  //       }
  //     };
  //     return urlGraph;
  //   });
