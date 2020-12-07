import * as io from 'io-ts';

interface Positive {
  readonly Positive: unique symbol;
}

interface NonNegative {
  readonly NonNegative: unique symbol;
}

export const Positive = io.brand(
  io.number,
  (n: number): n is io.Branded<number, Positive> => n > 0,
  'Positive'
);

export const NonNegative = io.brand(
  io.number,
  (n: number): n is io.Branded<number, NonNegative> => n >= 0,
  'NonNegative'
);


export const PositiveInt = io.intersection([io.Int, Positive])
export type PositiveInt = io.TypeOf<typeof PositiveInt>

export const NonNegativeInt = io.intersection([io.Int, NonNegative])
export type NonNegativeInt = io.TypeOf<typeof NonNegativeInt>

// export const Begin = NonNegativeInt;
const Begin = io.number;
export type Begin = io.TypeOf<typeof Begin>;

// const Length = NonNegativeInt;
const Length = io.number;
type Length = io.TypeOf<typeof Length>;

// export type Span = [Begin, Length];
export const Span = io.tuple([Begin, Length], 'Span');
export type Span = io.TypeOf<typeof Span>;

// export const PageNumber = PositiveInteger;
export const PageNumber = io.number;
