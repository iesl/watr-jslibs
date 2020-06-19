
import _ from "lodash";

import {
  prettyPrint,
  createReadLineStream,
  streamPump,
} from "commons";


type StatusCodes = {
  "200": null,
  "301": null,
  "302": null,
  "404": null,
  "500": null,
  // Just in case above doesn't cover it:
  "20x": null,
  "30x": null,
  "40x": null,
  "50x": null,

  // Manually scraped url from html
  //  (e.g., returned html has frames, and non-frame  links must be scraped and spidered)
  "scraped": null,
};

// TODO: Make this Url fetch record its own log
export type StatusCode = keyof StatusCodes;
/**
 * {req: http://doi.org/o1, res: http://ieee.org/paper/o1, code: 301 }
 */
export interface UrlChainLink {
  requestUrl: string;
  responseUrl?: string;
  status: StatusCode;
  timestamp: number;
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
    .throughF((line: string) => {
      const isCrawled = /DEBUG: Crawled/.test(line);
      const isCrawled200 = isCrawled && /\(200\)/.test(line);
      const isRedirect = /DEBUG: Redirecting \((30|meta)/.test(line);
      // const isForbidden = /DEBUG: Forbidden/.test(line);
      // const isCached = /\['cached'\]/.test(line);

      const isDEBUGLine = /S0097539792224838/.test(line);

      const urls1 = line.match(getUrlRE);

      if (isDEBUGLine) {
        prettyPrint({
          msg: 'log line',
          line,
          urls1,
          isCrawled,
          isRedirect,
        });
      }

      if (isRedirect && urls1) {
        const [toUrl, fromUrl] = urls1;
        const t = trimGetClause(toUrl);
        const f = trimGetClause(fromUrl);
        redirectFromGraph[f] = t;
        redirectToGraph[t] = f;
        if (isDEBUGLine) {
          prettyPrint({
            msg: '(redirect)',
            toUrl, t,
            fromUrl, f,
          });
        }
      }
      if (isCrawled && urls1) {
        const [crawlUrl] = urls1;
        const t = trimGetClause(crawlUrl);
        if (isCrawled200) {
          crawled200.add(t);
        } else {
          crawledErr.add(t);
        }
        if (isDEBUGLine) {
          prettyPrint({
            msg: '(crawled)',
            crawlUrl, t,
            isCrawled200
          });
        }
      }
      return line;
    });

  return pumpBuilder.toPromise()
    .then(() => {
      const redirectFrom = redirectFromGraph;
      const redirectTo = redirectToGraph;
      const crawledOk = crawled200;
      const crawledNotOk = crawledErr;
      const getChain = (url: string) => {
        const isDEBUGLine = /S0097539792224838/.test(url);
        const redirects: string[] = [url];
        let urlNext = redirectFrom[redirects[0]];
        if (isDEBUGLine) {
          prettyPrint({
            msg: 'getChain()',
            redirects, urlNext
          });
        }
        while (urlNext !== undefined && !redirects.includes(urlNext)) {
        // while (urlNext !== undefined) {
          redirects.unshift(urlNext);
          urlNext = redirectFrom[redirects[0]];
          if (isDEBUGLine) {
            prettyPrint({
              msg: 'while: from',
              redirects, urlNext
            });
          }
        }
        if (isDEBUGLine) {
          prettyPrint({
            msg: 'midway (pre)',
            redirects, urlNext
          });
        }
        redirects.reverse();
        urlNext = redirectTo[redirects[0]];
        if (isDEBUGLine) {
          prettyPrint({
            msg: 'midway (reversed)',
            redirects, urlNext
          });
        }
        while (urlNext !== undefined && !redirects.includes(urlNext)) {
        // while (urlNext !== undefined) {
          redirects.unshift(urlNext);
          urlNext = redirectTo[redirects[0]];
          if (isDEBUGLine) {
            prettyPrint({
              msg: 'while: to',
              redirects, urlNext
            });
          }
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
