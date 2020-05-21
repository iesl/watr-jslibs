import _ from "lodash";
import pumpify from "pumpify";
import { Stream } from "stream";
import { throughFunc, tapStream } from './stream-utils';

/**
 * Convenience builder for stream processes
 */
export interface PumpBuilder<ChunkT> {
  streams: Stream[];
  onDataF?: (t: ChunkT) => void;
  onCloseF?: (err: Error) => void;
  onEndF?: () => void;

  throughF<R>(f: (t: ChunkT) => Promise<R>): PumpBuilder<R>;
  throughF<R>(f: (t: ChunkT) => R): PumpBuilder<R>;
  // TODO throughTransform<R>(t: Transform): PumpBuilder<R>;

  // TODO rename mergeStrea
  viaStream<R>(s: Stream): PumpBuilder<R>;
  tap(f: (t: ChunkT, i?: number) => void): PumpBuilder<ChunkT>;
  onData(f: (t: ChunkT) => void): PumpBuilder<ChunkT>;
  onClose(f: (err?: Error) => void): PumpBuilder<ChunkT>;
  onEnd(f: () => void): PumpBuilder<ChunkT>;
  start(): Stream;
  toPromise(): Promise<void>;
}

type PartialPB<T> = Partial<PumpBuilder<T>>;

function appendStream<ChunkT>(
  builder: PumpBuilder<ChunkT>,
  vstr: Stream,
): PumpBuilder<any> {
  const newBuilder: PumpBuilder<any> = _.merge(
    {},
    builder,
    { streams: _.concat(builder.streams, [vstr]) },
  );

  return newBuilder;
}

export function createPump<ChunkT>(): PumpBuilder<ChunkT> {
  const merge = (builder: PumpBuilder<ChunkT>, part: PartialPB<ChunkT>) =>
    _.merge({}, builder, part);

  const pb0: PumpBuilder<ChunkT> = {
    streams: [],
    onData(f: (t: ChunkT) => void): PumpBuilder<ChunkT> {
      return merge(this, { onDataF: f });
    },
    onClose(f: (err?: Error) => void): PumpBuilder<ChunkT> {
      return merge(this, { onCloseF: f });
    },
    onEnd(f: () => void): PumpBuilder<ChunkT> {
      return merge(this, { onEndF: f });
    },
    throughF<R>(f: (t: ChunkT) => R): PumpBuilder<R> {
      return appendStream(this, throughFunc(f));
    },
    viaStream<R>(s: Stream): PumpBuilder<R> {
      return appendStream(this, s);
    },
    tap(f: (t: ChunkT, i?: number) => void): PumpBuilder<ChunkT> {
      return appendStream(this, tapStream(f));
    },
    start(): Stream {
      const pipe = pumpify.obj(this.streams);
      if (this.onCloseF) {
        pipe.on("close", this.onCloseF);
      }
      if (this.onEndF) {
        pipe.on("end", this.onEndF);
      }
      pipe.on("data", this.onDataF ? this.onDataF : () => undefined);
      return pipe;
    },

    toPromise(): Promise<void> {
      const self = this;

      return new Promise((resolve) => {
        const onEndF = self.onEndF;
        const str = self.start();
        str.on('end', () => {
          Promise.resolve(onEndF)
            .then(() => resolve());
        });
      });

    }

  };
  return pb0;
}
