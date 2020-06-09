import _ from "lodash";
import pumpify from "pumpify";
import { Stream } from "stream";
import { throughFunc, tapStream, filterStream, throughAccum, initEnv, WithEnv, unEnv } from './stream-utils';

/**
 * Convenience builder for stream processes
 */
export interface PumpBuilder<ChunkT, Env> {
  streams: Stream[];
  onDataF?: (t: ChunkT) => void;
  onCloseF?: (err: Error) => void;
  onEndF?: () => void;

  initEnv<E0>(f: (t?: ChunkT) => E0): PumpBuilder<ChunkT, E0>;

  viaStream<R>(s: Stream): PumpBuilder<R, Env>;

  throughF<R>(f: (t: ChunkT, env: Env) => Promise<R>): PumpBuilder<R, Env>;
  throughF<R>(f: (t: ChunkT, env: Env) => R): PumpBuilder<R, Env>;

  filter(f: (t: ChunkT, env: Env) => boolean): PumpBuilder<ChunkT, Env>;

  gather(): PumpBuilder<ChunkT[], Env>;

  tap(f: (t: ChunkT, env: Env) => void): PumpBuilder<ChunkT, Env>;

  // appendPump<ChT0, Env0>(pb: PumpBuilder<ChT0, Env0>) : PumpBuilder<ChunkT, Env>;

  onData(f: (t: ChunkT) => void): PumpBuilder<ChunkT, Env>;
  onClose(f: (err?: Error) => void): PumpBuilder<ChunkT, Env>;
  onEnd(f: () => void): PumpBuilder<ChunkT, Env>;
  start(): Stream;
  toStream(): Stream;
  toPromise(): Promise<ChunkT[]>;
}

type PartialPB<T, Env> = Partial<PumpBuilder<T, Env>>;

function appendStream<ChunkT, Env>(
  builder: PumpBuilder<ChunkT, Env>,
  vstr: Stream,
): PumpBuilder<any, any> {
  const newBuilder: PumpBuilder<any, any> = _.merge(
    {},
    builder,
    { streams: _.concat(builder.streams, [vstr]) },
  );

  return newBuilder;
}

function bufferChunks<ChunkT, Env>(pb: PumpBuilder<ChunkT, Env>) {
  const init: ChunkT[] = [];
  return appendStream(pb, throughAccum(
    (acc: ChunkT[],
      chunk: ChunkT | WithEnv<ChunkT, Env>,
      _onerr?: (e: any) => void
    ) => {
      const [t,] = unEnv(chunk);
      acc.push(t);
      return acc;
    },
    init
  ));

}

export function createPump<ChunkT, Env>(): PumpBuilder<ChunkT, Env> {
  const merge = (builder: PumpBuilder<ChunkT, Env>, part: PartialPB<ChunkT, Env>) =>
    _.merge({}, builder, part);

  const pb0: PumpBuilder<ChunkT, Env> = {
    streams: [],
    onData(f: (t: ChunkT) => void): PumpBuilder<ChunkT, Env> {
      return merge(this, { onDataF: f });
    },
    onClose(f: (err?: Error) => void): PumpBuilder<ChunkT, Env> {
      return merge(this, { onCloseF: f });
    },
    onEnd(f: () => void): PumpBuilder<ChunkT, Env> {
      return merge(this, { onEndF: f });
    },
    throughF<R>(f: (t: ChunkT, env: Env) => R): PumpBuilder<R, Env> {
      return appendStream(this, throughFunc<ChunkT, R, Env>(f));
    },
    filter(f: (t: ChunkT, env: Env) => boolean): PumpBuilder<ChunkT, Env> {
      return appendStream(this, filterStream(f));
    },
    gather(): PumpBuilder<ChunkT[], Env> {
      return bufferChunks(this);
    },
    initEnv<Env0>(f: (t?: ChunkT) => Env0): PumpBuilder<ChunkT, Env0> {
      return appendStream(this, initEnv(f));
    },
    viaStream<R>(s: Stream): PumpBuilder<R, Env> {
      return appendStream(this, s);
    },
    tap(f: (t: ChunkT, env: Env) => void): PumpBuilder<ChunkT, Env> {
      return appendStream(this, tapStream(f));
    },
    start(): Stream {
      const strm = this.toStream();
      if (!this.onDataF) {
        strm.on("data", () => undefined);
      }
      return strm;
    },
    toStream(): Stream {
      const pipe = pumpify.obj(this.streams);
      if (this.onCloseF) {
        pipe.on("close", this.onCloseF);
      }
      if (this.onEndF) {
        pipe.on("end", this.onEndF);
      }
      if (this.onDataF) {
        pipe.on("data", this.onDataF);
      }
      return pipe;
    },

    toPromise(): Promise<ChunkT[]> {
      const self = this;

      return new Promise((resolve) => {
        const bufferedStream = bufferChunks(self);
        bufferedStream
          .onData((d: ChunkT[]) => resolve(d))
          .start();
      });

    }

  };
  return pb0;
}
