
import * as _ from 'lodash';

import { Context } from "koa";
import path from "path";
import  Router from "koa-router";
import fs, { realpathSync } from "fs-extra";

// import klaw from "klaw-sync";
// type ArtifactType = "pdf" | "page-images" | "page-thumbs" | "textgrids" | "tracelogs";

export interface CorpusArtifacts {
  stableId: string;
  artifacts: string[];
}
export interface CorpusEntry {
  stableId: string;
  artifacts: [string, string[]][];
}

export interface CorpusPage {
  corpusEntries: CorpusEntry[];
  corpusSize: number;
  offset: number;

}

export function readCorpusEntries(
  corpusRoot: string,
  start: number,
  len: number
): CorpusPage {
  const entryNames = fs.readdirSync(corpusRoot);
  const entryWindow = entryNames.slice(start, start+len);

  const entries: CorpusEntry[] = _.flatMap(entryWindow, (entryName) => {
    const entryPath = path.join(corpusRoot, entryName);
    const statEntry = fs.statSync(entryPath);
    if (statEntry.isDirectory()) {

      const entryListing = fs.readdirSync(entryPath);
      const hasPdf = entryListing.find(e => e.endsWith(".pdf"));
      const subDirs: [string, string[]][] = _.flatMap(entryListing, (e) => {
        const subDir = path.join(entryPath, e);
        const stat = fs.statSync(subDir);
        const isDir = stat.isDirectory();
        let result:  [string, string[]][] = []
        if (isDir) {
          const artifactContent = fs.readdirSync(subDir);
          if ( artifactContent.length > 0 ) {
            result = [ [e, artifactContent] ];
          }
        }

        return result;
      });


      if (hasPdf) {
        const stableId = entryName.slice(0, entryName.length - ('.d'.length));
        const e: CorpusEntry = {
          stableId,
          artifacts: subDirs
        };
        return [e];
      }
    }
    return [];

  });

  const corpusPage = {
    corpusEntries: entries,
    corpusSize: entryNames.length,
    offset: start
  };

  return corpusPage;
}


export function initFileBasedRoutes(corpusRootPath: string): Router {
  const apiRouter = new Router();
  const corpusRoot = realpathSync(corpusRootPath);

  apiRouter.prefix("/api")
    .get("/corpus/entries", async (ctx: Context) => {
      const { start, len } = ctx.query;
      const offset: number = start? parseInt(start) : 0;
      const length: number = len? parseInt(len) : 50;
      const corpusPage = await readCorpusEntries(corpusRoot, offset, length);

      ctx.body = corpusPage;
    })
  ;

  return apiRouter;

}
