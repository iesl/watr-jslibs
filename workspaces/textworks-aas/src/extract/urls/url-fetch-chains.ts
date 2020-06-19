
import _ from "lodash";

import {
  prettyPrint,
  createReadLineStream,
  streamPump,
} from "commons";


// type StatusCodes = {
//   "200": "200",
//   "301": "301",
//   "302": "302",
//   "404": "404",
//   "500": "500",
//   "20x": "20x",
//   "30x": "30x",
//   "40x": "40x",
//   "50x": "50x",

//   // Robots.txt
//   "Forbidden": null,

//   // Manually scraped url from html
//   //  (e.g., returned html has frames, and non-frame  links must be scraped and spidered)
//   "scraped": null,
// };

// // TODO: Make this Url fetch record its own log
// export type StatusCode = keyof StatusCodes;
/**
 * {req: http://doi.org/o1, res: http://ieee.org/paper/o1, code: 301 }
 */
export interface UrlChainLink {
  requestUrl: string;
  responseUrl?: string;
  status: string;
  timestamp: string;
}

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

export function parseLogLine(logline: string): UrlChainLink | string | undefined {
  // const isCrawled = /DEBUG: Crawled/.test(logline);
  // const isCrawled200 = isCrawled && /\(200\)/.test(logline);
  // const isRedirect = /DEBUG: Redirecting \((30|meta)/.test(logline);
  // const isForbidden = /DEBUG: Forbidden/.test(logline);

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

  // prettyPrint({ httpCodeMatches });

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

  const [, httpAction, httpStatus] = httpCodeMatches? httpCodeMatches : [undefined, undefined, undefined];

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

// These are the log entries we care about from scrapy
// cat crawler.log | egrep -v '\[protego\]' | egrep -v '\[scrapy\.(down|ext|core|utils|crawler|spidermiddle)'
export async function readUrlFetchChainsFromScrapyLogs(logfile: string): Promise<UrlGraph> {
  const inputStream = createReadLineStream(logfile)
  const redirectFromGraph: _.Dictionary<string> = {};
  const redirectToGraph: _.Dictionary<string> = {};
  const crawled200 = new Set<string>();
  const crawledErr = new Set<string>();
  const getUrlRE = new RegExp('<GET ([^>]*)>([ ]|$)', 'g');

  const pumpBuilder = streamPump.createPump()
    .viaStream<string>(inputStream)
    .tap((line: string) => {
      const isCrawled = /DEBUG: Crawled/.test(line);
      const isCrawled200 = isCrawled && /\(200\)/.test(line);
      const isRedirect = /DEBUG: Redirecting \((30|meta)/.test(line);
      const isForbidden = /DEBUG: Forbidden/.test(line);

      const isRelevantLine = isCrawled || isRedirect || isForbidden;

      const timestampRE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/;
      const timestampMatch = line.match(timestampRE);

      if (!isRelevantLine) return;
      if (timestampMatch == null) return;
      const httpCodeRE = /DEBUG: (\w+): ([(]\d{3}[)]) /;

      const dateAsString = timestampMatch[0];
      const dateAsNum = Date.parse(dateAsString);
      if (isNaN(dateAsNum)) return;

      const urls1 = line.match(getUrlRE);

      if (isRedirect && urls1) {
        const [toUrl, fromUrl] = urls1;
        const responseUrl = trimGetClause(toUrl);
        const requestUrl = trimGetClause(fromUrl);
        redirectFromGraph[requestUrl] = responseUrl;
        redirectToGraph[responseUrl] = requestUrl;
        const chainLink: UrlChainLink = {
          requestUrl,
          responseUrl,
          status: "30x",
          timestamp: dateAsString
        };
      }
      if (isCrawled && urls1) {
        const [crawlUrl] = urls1;
        const t = trimGetClause(crawlUrl);
        if (isCrawled200) {
          crawled200.add(t);
        } else {
          crawledErr.add(t);
        }
      }
    });

  return pumpBuilder.toPromise()
    .then(() => {
      const redirectFrom = redirectFromGraph;
      const redirectTo = redirectToGraph;
      const crawledOk = crawled200;
      const crawledNotOk = crawledErr;
      const getChain = (url: string) => {
        const redirects: string[] = [url];
        let urlNext = redirectFrom[redirects[0]];
        while (urlNext !== undefined && !redirects.includes(urlNext)) {
          redirects.unshift(urlNext);
          urlNext = redirectFrom[redirects[0]];
        }
        redirects.reverse();
        urlNext = redirectTo[redirects[0]];
        while (urlNext !== undefined && !redirects.includes(urlNext)) {
          redirects.unshift(urlNext);
          urlNext = redirectTo[redirects[0]];
        }
        return redirects;
      };

      return {
        isUrlCrawled(url: string): boolean {
          const chain = getChain(url);
          const filtered = chain.filter(churl => crawledOk.has(churl) || crawledNotOk.has(churl));
          return filtered.length > 0;
        },

        getUrlFetchChain(url: string): string[] {
          return getChain(url);
        }
      }
    });
}
