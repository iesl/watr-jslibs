//
import * as io from 'io-ts';

interface Positive {
  readonly Positive: unique symbol;
}

interface NonNegative {
  readonly NonNegative: unique symbol;
}

export const PositiveNumber = io.brand(
  io.number,
  (n: number): n is io.Branded<number, Positive> => n > 0,
  "Positive"
);

export const NonNegativeNumber = io.brand(
  io.number,
  (n: number): n is io.Branded<number, NonNegative> => n >= 0,
  "NonNegative"
);

export const PositiveInteger = io.brand(
  io.number,
  (n: number): n is io.Branded<number, Positive> => n > 0 && Number.isInteger(n),
  "Positive"
);

export const NonNegativeInteger = io.brand(
  io.number,
  (n: number): n is io.Branded<number, NonNegative> => n >= 0 && Number.isInteger(n),
  "NonNegative"
);
