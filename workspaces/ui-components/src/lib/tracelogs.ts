//
import _ from "lodash";


export interface ILogHeaders {
  tags: string;
  name: string;
  callSite: string;
  timestamp: number;
}

export interface ILogEntry {
  headers: ILogHeaders;
  body: any[];
  logType: string;
  page: number;
}

