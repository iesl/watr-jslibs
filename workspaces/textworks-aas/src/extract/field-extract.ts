import _ from "lodash";

export interface Field {
  name: string;
  evidence: string;
  value?: string;
  error?: string;
  complete?: boolean;
}
