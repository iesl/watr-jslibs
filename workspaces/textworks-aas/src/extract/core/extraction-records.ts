
/**
 * Logs and Records generated during field extraction and Url scraping
 */


export type ExtractionLog = Record<string, any>;

// TODO: save this record when processing html cache during extraction
// Copy of the record supplied by the OpenReview team
export interface AlphaRecord {
  noteId: string;
  dblpConfId: string;
  title?: string;
  authorId?: string;
  url: string;
}

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
