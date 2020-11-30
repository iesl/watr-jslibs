/**
 * Various Utility functions
 */
import _ from 'lodash'
import * as io from 'io-ts'
import { isRight } from 'fp-ts/lib/Either'
import { PathReporter } from 'io-ts/lib/PathReporter'

export function getOrDie<T>(v: T | null | undefined, msg: string = 'null|undef'): T {
  if (v === null || v === undefined) {
    throw new Error(`Error: ${msg}`)
  }
  return v
}
/**
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

export function newIdGenerator() {
  let currId = -1
  const nextId = () => {
    currId += 1
    return currId
  }
  return nextId
}

export function isIsomorphic<A, O, I>(ioType: io.Type<A, O, I>, input: I, verbose: boolean = false): boolean {
  const dec = ioType.decode(input)
  if (isRight(dec)) {
    const adecoded = dec.right
    const aencoded = ioType.encode(adecoded)
    if (_.isEqual(aencoded, input)) {
      if (verbose) {
        // prettyPrint({ m: `isIsomorphic(${ioType.name}) === true`, input, adecoded })
      }
      return true
    }
    if (verbose) {
      // prettyPrint({ m: `isIsomorphic(${ioType.name}) === false`, input, adecoded, aencoded })
    }
    return false
  }
  const report = PathReporter.report(dec)
  if (verbose) {
    // prettyPrint({ m: `isIsomorphic(${ioType.name}) === false`, report, input })
  }
  return false
}
