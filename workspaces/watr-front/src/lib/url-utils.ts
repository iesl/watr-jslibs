/**
 * Various URL related utility functions
 */
import _ from 'lodash'

export function corpusEntry(): string {
  const entry = location.href.split('/').reverse()[0].split('?')[0]
  return entry
}

export function getParameterByName(name: string, urlstr?: string) {
  let url = urlstr
  if (!url) { url = window.location.href }
  const name0 = name.replace(/[[]]/g, '\\$&')
  const regex = new RegExp(`[?&]${name0}(=([^&#]*)|&|#|$)`)
  const results = regex.exec(url)
  if (!results) { return null }
  if (!results[2]) { return '' }
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

export function getURLQueryParams() {
  const uri = window.location.search.substring(1);
  return new URLSearchParams(uri);
}

export function getURLQueryParam(key: string): string | undefined {
  const ps = getURLQueryParams();
  const v = ps.get(key);
  return _.isString(v)? v : undefined;
}


// type Dictionary<T> = { [key: string]: T }
// type QObject = Dictionary<string | (string | null)[]>;
// export function getQueryString(queryObject: QObject, key: string): string | undefined {
//   const qval = queryObject[key]
//   if (typeof qval === 'string') {
//     return qval
//   }
//   return undefined
// }
