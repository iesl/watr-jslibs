import _ from "lodash";

interface ShapeMetaInfo {
  id: number;
  labels: string;
}

type ShapeAndMeta = Shape & ShapeMetaInfo;

export interface LogHeaders {
  tags: string;
  name: string;
  callSite: string;
  timestamp: number;
}

export interface LogEntry {
  headers: LogHeaders;
  body: ShapeAndMeta[];
  logType: string;
  page: number;
}

export type Tracelog = LogEntry[];

export interface LogEntryGroup {
  groupKey: string;
  logEntries: LogEntry[];
}

export function groupTracelogsByKey(tracelog: Tracelog): LogEntryGroup[] {
  const keyFunc = (l: LogEntry) => {
    return `p${l.page + 1}. ${l.headers.callSite} ${l.headers.tags}`;
  };

  const keyedLogs = _.map(tracelog, tl => [tl, keyFunc(tl)] as const);

  const groupedLogs = _.groupBy(keyedLogs, ([, key]) => key);
  const groupedLogPairs = _.toPairs(groupedLogs);
  const entryGroups = _.map(groupedLogPairs, ([groupKey, logs]) => {
    return {
      groupKey,
      logEntries: logs.map(([l,]) => l)
    }
  });

  return entryGroups;
}


export interface Point {
  kind: 'point';
  x: number;
  y: number;
}

export interface Line {
  kind: 'line';
  p1: Point;
  p2: Point;
}

export interface Rect {
  kind: 'rect';
  bounds: [number, number, number, number];
}

export interface Trapezoid {
  kind: 'trapezoid';

  topLeft: Point;
  topWidth: number;
  bottomLeft: Point;
  bottomWidth: number;
}


export type Shape = Line | Rect | Point | Trapezoid;

export type ShapeKind = Shape['kind'];


type LineFold<T> = (l: Line) => T
type RectFold<T> = (l: Rect) => T
type PointFold<T> = (l: Point) => T
type TrapezoidFold<T> = (l: Trapezoid) => T

export interface FoldF<T> {
  line: LineFold<T>;
  rect: RectFold<T>;
  point: PointFold<T>;
  trapezoid: TrapezoidFold<T>;
}

export interface FoldX<T, U, V, W> {
  line: LineFold<T>;
  rect: RectFold<U>;
  point: PointFold<V>;
  trapezoid: TrapezoidFold<W>;
}

export type Folds<T> = Partial<FoldF<T>>;

export function foldShape<T>(shape: Shape, fs: Folds<T>): T | undefined {
  switch (shape.kind) {
    case 'line': return fs.line ? fs.line(shape) : undefined;
    case 'rect': return fs.rect ? fs.rect(shape) : undefined;
    case 'point': return fs.point ? fs.point(shape) : undefined;
    case 'trapezoid': return fs.trapezoid ? fs.trapezoid(shape) : undefined;
  }
}

export function mapShape(shape: Shape, fs: FoldF<Shape>): Shape {
  const f = foldShape(shape, fs);
  return f!;
}

export function foldShapeTotal<S, T, U, V>(shape: Shape, fs: FoldX<S, T, U, V>): S | T | U | V {
  switch (shape.kind) {
    case 'line': return fs.line(shape);
    case 'rect': return fs.rect(shape);
    case 'point': return fs.point(shape);
    case 'trapezoid': return fs.trapezoid(shape);
  }
}

export function transformShape<S, T, U, V>(shape: Shape, fs: FoldX<S, T, U, V>): S | T | U | V {
  switch (shape.kind) {
    case 'line': return fs.line(shape);
    case 'rect': return fs.rect(shape);
    case 'point': return fs.point(shape);
    case 'trapezoid': return fs.trapezoid(shape);
  }
}


function adjustUnitsPoint(p: Point): Point {
  const x = p.x / 100.0;
  const y = p.y / 100.0;
  const { kind } = p;
  return {
    x, y,
    kind
  };
}

export const ShapeIntRepsToFloats: FoldF<Shape> = {
  line: (sh: Line) => {
    const p1 = adjustUnitsPoint(sh.p1);
    const p2 = adjustUnitsPoint(sh.p2);
    const { kind } = sh;
    return {
      p1, p2,
      kind
    };
  },

  point: (sh: Point) => adjustUnitsPoint(sh),

  rect: (sh: Rect) => {
    const [l, t, w, h] = sh.bounds;
    const x = l / 100.0;
    const y = t / 100.0;
    const width = w / 100.0;
    const height = h / 100.0;
    const { kind } = sh;
    return {
      bounds: [x, y, width, height],
      kind
    };
  },

  trapezoid: (sh: Trapezoid) => {
    const topLeft = adjustUnitsPoint(sh.topLeft);
    const bottomLeft = adjustUnitsPoint(sh.bottomLeft);
    const topWidth = sh.topWidth / 100.0;
    const bottomWidth = sh.bottomWidth / 100.0;
    const { kind } = sh;
    return {
      topLeft, topWidth,
      bottomLeft, bottomWidth,
      kind
    };
  }
};

export const ShapeToSvgFold: Folds<object> = {
  line: (sh: Line) => {
    return {
      type: "line",
      x1: sh.p1.x,
      x2: sh.p2.x,
      y1: sh.p1.y,
      y2: sh.p2.y,
    };
  },

  point: (sh: Point) => {
    return {
      type: "circle",
      r: 3,
      cx: sh.x,
      cy: sh.y,
    };
  },

  rect: (sh: Rect) => {
    const [x, y, width, height] = sh.bounds;
    return {
      type: "rect",
      x, y,
      width, height,
    };
  },

  trapezoid: (sh: Trapezoid) => {
    const p1 = sh.topLeft;
    const p2x = p1.x + sh.topWidth;
    const p2y = p1.y;
    const p3x = sh.bottomLeft.x + sh.bottomWidth;
    const p3y = sh.bottomLeft.y;
    const p4 = sh.bottomLeft;
    return {
      type: "path",
      d: `M ${p1.x} ${p1.y} L ${p2x} ${p2y} L ${p3x} ${p3y} L ${p4.x} ${p4.y} Z`,
    };
  }
};



export const ShapeToSvgElement: Folds<SVGGraphicsElement> = {
  line: (sh: Line) => {
    const elem: SVGLineElement = document.createElementNS("http://www.w3.org/2000/svg", "line");
    const x1 = `${sh.p1.x}`;
    const y1 = `${sh.p1.y}`;
    const x2 = `${sh.p2.x}`;
    const y2 = `${sh.p2.y}`;
    elem.setAttribute("x1", x1);
    elem.setAttribute("y1", y1);
    elem.setAttribute("x2", x2);
    elem.setAttribute("y2", y2);
    elem.setAttribute("fill", "red");
    elem.setAttribute("stroke", "black");
    return elem;
  },

  point: (sh: Point) => {
    const elem: SVGCircleElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const x = `${sh.x}`;
    const y = `${sh.y}`;
    const r = `3`;
    elem.setAttribute("cx", x);
    elem.setAttribute("cy", y);
    elem.setAttribute("r", r);
    elem.setAttribute("fill", "red");
    elem.setAttribute("stroke", "black");
    return elem;
  },

  rect: (sh: Rect) => {
    const elem = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    const [x0, y0, width0, height0] = sh.bounds;
    const x = `${x0}`;
    const y = `${y0}`;
    const width = `${width0}`;
    const height = `${height0}`;

    elem.setAttribute("x", x);
    elem.setAttribute("y", y);
    elem.setAttribute("width", width);
    elem.setAttribute("height", height);
    elem.setAttribute("fill", "red");
    elem.setAttribute("stroke", "black");
    return elem;
  },

  trapezoid: (sh: Trapezoid) => {
    const elem: SVGPathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const p1 = sh.topLeft;
    const p2x = p1.x + sh.topWidth;
    const p2y = p1.y;
    const p3x = sh.bottomLeft.x + sh.bottomWidth;
    const p3y = sh.bottomLeft.y;
    const p4 = sh.bottomLeft;
    const d = `M ${p1.x} ${p1.y} L ${p2x} ${p2y} L ${p3x} ${p3y} L ${p4.x} ${p4.y} Z`;
    elem.setAttribute("d", d);
    return elem;
  }
};

type ShapeForKind<T extends ShapeKind> =
  T extends Point['kind'] ? Point :
  T extends Rect['kind'] ? Rect :
  T extends Line['kind'] ? Line :
  T extends Trapezoid['kind'] ? Trapezoid :
  never;

export type InitFn<S extends Shape> = (s: S) => S

type Ret<T extends ShapeKind> =
  T extends Point['kind'] ? Point :
  T extends Rect['kind'] ? Rect :
  T extends Line['kind'] ? Line :
  T extends Trapezoid['kind'] ? Trapezoid :
  never;

type PointInits = [number, number];

type InitT<T extends ShapeKind> =
  T extends Point['kind'] ? PointInits :
  T extends Rect['kind'] ? [number, number, number, number] :
  T extends Line['kind'] ? [PointInits, PointInits] :
  T extends Trapezoid['kind'] ? [PointInits, PointInits, number, number] :
  never
  ;


export function initShape<S extends ShapeKind, V extends Ret<S>>(kind: S, initVals: InitT<S>): V {
  switch (kind) {
    case 'point': {
      const [x, y] = initVals as InitT<'point'>;
      const point: Point = {
        kind: 'point', x, y,
      };
      return point as V;
    }
    case "line": {
      const [i1, i2] = initVals as InitT<'line'>;
      const p1 = initShape('point', i1);
      const p2 = initShape('point', i2);
      const line: Line = {
        kind: 'line', p1, p2,
      };

      return line as V;
    }
    case "rect": {
      const bounds = initVals as InitT<'rect'>;
      const rect: Rect = {
        kind: 'rect', bounds
      };
      return rect as V;
    }
    case "trapezoid": {
      const [tl, bl, topWidth, bottomWidth] = initVals as InitT<'trapezoid'>;
      const topLeft: Point = initShape('point', tl);
      const bottomLeft: Point = initShape('point', bl);

      const trap: Trapezoid = {
        kind: 'trapezoid', topLeft, bottomLeft, topWidth, bottomWidth
      };

      return trap as V;
    }
  }

  return undefined as any as V;
}

export function zeroShape0
  <K extends ShapeKind, S extends ShapeForKind<K>>
  (kind: K, f: (s: S) => S = s => s): S {
  const x = 0;
  const y = 0;
  const p: Point = zeroShape0('point');
  switch (kind) {
    case 'point': {
      const point: Point = {
        kind: 'point', x, y
      };

      return f(point as S);
    }
    case "line": {
      const line: Line = {
        kind: 'line', p1: p, p2: p,
      };

      return f(line as S);
    }
    case "rect": {
      const rect: Rect = {
        kind: 'rect', bounds: [0, 0, 0, 0]
      };

      return f(rect as S);
    }
    case "trapezoid": {

      const trap: Trapezoid = {
        kind: 'trapezoid', topLeft: p, bottomLeft: p, topWidth: 0, bottomWidth: 0
      };

      return f(trap as S);
    }
  }

  return undefined as any as S;
}

export function zeroShape1
  <K extends ShapeKind,
    S extends ShapeForKind<K>,
    T extends ShapeForKind<K>,
    U extends ShapeForKind<K>,
    V extends ShapeForKind<K>
  >
  (kind: K, fold: FoldX<S, T, U, V> | undefined = undefined): S | T | U | V {
  const x = 0;
  const y = 0;
  switch (kind) {
    case 'point': {
      const point: Point = {
        kind: 'point', x, y
      };

      if (fold) {
        return foldShapeTotal(point, fold);
      }
      return point as S;
    }
    case "line": {
      const p: Point = zeroShape1('point');
      const line: Line = {
        kind: 'line', p1: p, p2: p,
      };
      if (fold) {
        return foldShapeTotal(line, fold);
      }

      return line as S;
    }
    case "rect": {
      const rect: Rect = {
        kind: 'rect', bounds: [0, 0, 0, 0]
      };

      if (fold) {
        return foldShapeTotal(rect, fold);
      }
      return rect as S;
    }
    case "trapezoid": {


      const p: Point = zeroShape1('point');
      const trap: Trapezoid = {
        kind: 'trapezoid', topLeft: p, bottomLeft: p, topWidth: 0, bottomWidth: 0
      };

      if (fold) {
        return foldShapeTotal(trap, fold);
      }
      return trap as S;
    }
  }

  return undefined as any as S;
}
