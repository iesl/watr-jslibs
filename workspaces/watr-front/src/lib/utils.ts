/**
 * Various Utility functions
 */
import _ from 'lodash'
import * as io from 'io-ts'
import { isLeft } from 'fp-ts/lib/Either'
import { PathReporter } from 'io-ts/lib/PathReporter'
import { prettyPrint } from 'commonlib-shared'

export function getOrDie<T>(v: T | null | undefined, msg: string = 'null|undef'): T {
  if (v === null || v === undefined) {
    throw new Error(`Error: ${msg}`)
  }
  return v
}

/**
 *
 */
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


export function newIdGenerator(start: number) {
  let currId = start-1;
  const nextId = () => {
    currId += 1;
    return currId;
  };
  return nextId;
}

// export function isIsomorphic<A, O, I>(ioType: io.Type<A, O, I>, input: I, verbose: boolean = false): boolean {
export function isIsomorphic<A, IO>(ioType: io.Type<A, IO, IO>, input: IO, verbose: boolean = false): boolean {
  const maybeDecoded = ioType.decode(input)
  if (isLeft(maybeDecoded)) {
    const report = PathReporter.report(maybeDecoded)
    if (verbose) {
      prettyPrint({ m: `isIsomorphic(${ioType.name})/decode === false`, input, report })
    }
    return false
  }

  const decoded = maybeDecoded.right
  const reEncoded = ioType.encode(decoded)
  if (!_.isEqual(input, reEncoded)) {
    if (verbose) {
      prettyPrint({ m: `isIsomorphic(${ioType.name})/re-encode === false`, input, decoded, reEncoded })
    }
    return false;
  }

  const maybeReDecoded = ioType.decode(reEncoded)
  if (isLeft(maybeReDecoded)) {
    const report = PathReporter.report(maybeReDecoded)
    if (verbose) {
      prettyPrint({ m: `isIsomorphic(${ioType.name})/re-decode === false`, report, input, reEncoded })
    }
    return false
  }

  const reDecoded = maybeReDecoded.right;

  if (!_.isEqual(decoded, reDecoded)) {
    if (verbose) {
      prettyPrint({ m: `isIsomorphic(${ioType.name})/re-decode === false`, input, decoded, reDecoded })
    }
    return false;
  }

  if (verbose) {
    prettyPrint({ m: `isIsomorphic(${ioType.name}) === true`, input, decoded, reEncoded, reDecoded })
  }

  return true
}
