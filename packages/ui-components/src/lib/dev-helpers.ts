
/* tslint:disable: no-console */


import _ from "lodash";
import $ from 'jquery';

import { CandidateGroup, GroupKey } from './FilterEngine';


export function pp(a: any): string {
  return JSON.stringify(a, undefined, 2);
}

export function asyncGetJson<T>(url: string): Promise<T> {
  return new Promise( (resolve: ((t:T) => void), reject: ((s:string) => void)) => {
    $.getJSON(url, (response: any) => {
      return resolve(response)
    }).fail((xhr, status, err) => reject(`Server Error (${status}): ${err}, ${xhr.toString()}`));
  });
}

export interface ILogHeaders {
  tags: string;
  name: string;
  callSite: string;
  timestamp: number;
}

export interface ILogBody {
}

export interface ILogEntry {
  headers: ILogHeaders;
  body: ILogBody;
  logType: string;
  page: number;
}

export function candidateGroupF(
  name: string,
  tags: string,
  groupKeyFunc: (c: ILogEntry) => GroupKey
): CandidateGroup {
  const candidates = _.map(
    _.range(0, 3), i => ({
      page: i,
      logType: 'Geometry',
      tags: `${tags} #${i}`,
      name: `${name}${i+1}`
    })
  );

  const cset: CandidateGroup = {
    candidates,
    groupKeyFunc
  };

  return cset;
}

export function candidateGroup(
  name: string,
  tags: string
): CandidateGroup {
  return candidateGroupF(
    name, tags,
    (c: ILogEntry) => {
      const multikey = [name, `page=${c.page}`, `${c.tags}`];
      const displayTitle = 'Todo??';
      return { multikey, displayTitle };
    }
  );
}
