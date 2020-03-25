/**
 * Shape types and serialization functions
 */

import * as io from 'io-ts';
import { either } from 'fp-ts/lib/Either'

export interface Point {
  kind: 'point';
  x: number;
  y: number;
}

export interface Circle {
  kind: 'circle';
  p: Point;
  r: number;
}


export interface Line {
  kind: 'line';
  p1: Point;
  p2: Point;
}

export interface Triangle {
  kind: 'triangle';
  p1: Point;
  p2: Point;
  p3: Point;
}

export interface Rect {
  kind: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Trapezoid {
  kind: 'trapezoid';

  topLeft: Point;
  topWidth: number;
  bottomLeft: Point;
  bottomWidth: number;
}

export type Shape = Point | Line | Circle | Triangle | Rect | Trapezoid;

export type ShapeKind = Shape['kind'];


// Serialized Shape Representations

export type PointSer = readonly [number, number];
export type CircleSer = readonly [PointSer, number];
export type LineSer = readonly [PointSer, PointSer];
export type TriangleSer = readonly [PointSer, PointSer, PointSer];
export type RectSer = readonly [number, number, number, number];
export type QuadSer = readonly [PointSer, PointSer, PointSer, PointSer];
export type TrapezoidSer = readonly [PointSer, number, PointSer, number];

export type ShapeSer = PointSer | RectSer | LineSer | CircleSer | TriangleSer | TrapezoidSer;

function isPointV(t: number | PointSer): t is PointSer {
  return !isNumber(t);
}
function isNumber(t: number | PointSer): t is number {
  return typeof t === "number";
}

function isPointT(s: ShapeSer): s is PointSer {
  return s.length===2 && isNumber(s[0]);
}

export function isLineT(s: ShapeSer): s is LineSer {
  return s.length===2 && isPointV(s[0]) && isPointV(s[1]);
}

function isCircleT(s: ShapeSer): s is CircleSer {
  return s.length===2 && isPointV(s[0]) && isNumber(s[1]);
}
function isRectT(s: ShapeSer): s is RectSer {
  return s.length===2 && isPointV(s[0]) && isNumber(s[1]);
}

function isTriangleT(s: ShapeSer): s is TriangleSer {
  return s.length===3
    && isPointV(s[0])
    && isPointV(s[1])
    && isPointV(s[2]);
}

// function isTrapezoidT(s: ShapeSer): s is TrapezoidSer {
//   return s.length===4
//     && isPointV(s[0]) && isNumber(s[1])
//     && isPointV(s[2]) && isNumber(s[3]);
// }

function intToFloatRep(n: number): number {
  return n / 100.0;
}

function floatToIntRep(n: number): number {
  return Math.trunc(n * 100.0);
}

function deserPoint(pointSer: PointSer): Point {
  const [x, y] = pointSer;
  return { kind: "point", x: intToFloatRep(x), y: intToFloatRep(y)  };
}

export function deserRect(ss: RectSer): Rect {
  return { kind: "rect", x:
           intToFloatRep(ss[0]), y: intToFloatRep(ss[1]),
           width: intToFloatRep(ss[2]), height: intToFloatRep(ss[3]) };
}

export function deserialize(ss: ShapeSer): Shape {
  if (isPointT(ss)) {
    return deserPoint(ss);
  }
  if (isLineT(ss)) {
    return { kind: "line", p1: deserPoint(ss[0]), p2: deserPoint(ss[1]) };
  }
  if (isCircleT(ss)) {
    return { kind: "circle", p: deserPoint(ss[0]), r: intToFloatRep(ss[1]) };
  }
  if (isTriangleT(ss)) {
    return { kind: "triangle", p1: deserPoint(ss[0]), p2: deserPoint(ss[1]), p3: deserPoint(ss[2])  };
  }
  if (isRectT(ss)) {
    return deserRect(ss);
  }
  return { kind: "trapezoid",
           topLeft: deserPoint(ss[0]), topWidth: intToFloatRep(ss[1]),
           bottomLeft: deserPoint(ss[2]), bottomWidth: intToFloatRep(ss[3]) };
}



export const RectRepr = io.tuple<io.NumberType, io.NumberType, io.NumberType, io.NumberType>(
  [io.number, io.number, io.number, io.number], "RectRepr"
);

export type RectRepr = io.TypeOf<typeof RectRepr>;

export const Rect = new io.Type<Rect, RectRepr, unknown>(
  "Rect",
  (a: any): a is Rect => a['kind'] === 'rect',
  (u: unknown, c: io.Context) => either.chain(
    RectRepr.validate(u, c),
    n4 => io.success(deserRect(n4))
  ),
  (a: Rect) => {
    const { x, y, width, height } = a;
    const xi = floatToIntRep(x);
    const yi = floatToIntRep(y);
    const wi = floatToIntRep(width);
    const hi = floatToIntRep(height);
    return [xi, yi, wi, hi];
  }
);
