import { pipe } from 'fp-ts/lib/pipeable';
import * as E from 'fp-ts/lib/Either';
import * as TE from 'fp-ts/lib/TaskEither';
import { PathReporter } from 'io-ts/lib/PathReporter'
import { getArtifactData } from './axios';
import { Tracelog } from './transcript/tracelogs';
import * as io from 'io-ts'
import { Transcript } from './transcript/transcript';

export function fetchAndDecode<A, IO>(
  ioType: io.Type<A, IO, IO>,
  fetcher: () => Promise<E.Either<string[], IO>>,
): TE.TaskEither<string[], A> {
  return pipe(
    () => fetcher(),
    TE.chain(json => () => Promise.resolve(pipe(
      ioType.decode(json),
      E.mapLeft(errors => PathReporter.report(E.left(errors)))
    ))),
  );
}

export const fetchAndDecodeTracelog = (entryId: string): TE.TaskEither<string[], Tracelog> => {
  const fetcher = () => getArtifactData<any>(entryId, 'tracelog', 'tracelog')
    .then(data => data === undefined ?
      E.left([`could not fetch tracelog ${entryId}`])
      : E.right(data));

  return fetchAndDecode(Tracelog, fetcher);
}

export const fetchAndDecodeTranscript = (entryId: string): TE.TaskEither<string[], Transcript> => {
  const fetcher = () => getArtifactData<any>(entryId, 'transcript')
    .then(data => data === undefined ?
      E.left([`could not fetch transcript ${entryId}`])
      : E.right(data));

  return fetchAndDecode(Transcript, fetcher);
}
