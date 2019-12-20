//
import _ from "lodash";


export interface ILogHeaders {
  tags: string;
  name: string;
  callSite: string;
  timestamp: number;
}

export interface ILogEntry {
  headers: ILogHeaders;
  body: Shape[];
  logType: string;
  page: number;
}

interface BaseShape {
  id: number;
  labels: string;
}

export interface Point extends BaseShape {
  kind: 'point';

  x: number;
  y: number;
}
export interface Line extends BaseShape {
  kind: 'line';

  p1: Point;
  p2: Point;
}

export interface Rect extends BaseShape {
  kind: 'rect';
  bounds: [number, number, number, number];
}

export interface Trapezoid extends BaseShape {
  kind: 'trapezoid';

  topLeft: Point;
  topWidth: number;
  bottomLeft: Point;
  bottomWidth: number;
}

export type Shape = Line | Rect | Point | Trapezoid;

type LineFold<T>      = (l: Line) => T
type LTBoundsFold<T>  = (l: Rect) => T
type PointFold<T>     = (l: Point) => T
type TrapezoidFold<T> = (l: Trapezoid) => T

export interface Folds<T> {
 line?: LineFold<T>;
 rect?: LTBoundsFold<T>;
 point?: PointFold<T>;
 trapezoid? :TrapezoidFold<T>;
}

export function foldShape<T>(shape: Shape, fs:Folds<T>): T|undefined {
  switch(shape.kind) {
    case 'line': return fs.line? fs.line(shape) : undefined;
    case 'rect': return fs.rect? fs.rect(shape) : undefined;
    case 'point': return fs.point? fs.point(shape) : undefined;
    case 'trapezoid': return fs.trapezoid? fs.trapezoid(shape) : undefined;
  }
}


function adjustUnitsPoint(p: Point): Point  {
  const x = p.x / 100.0;
  const y = p.y / 100.0;
  const { kind, id, labels } = p;
  return {
    x, y,
    kind, id, labels
  };
}

export const ShapeAdjustUnitsFold: Folds<Shape> = {
  line: (sh: Line) => {
    const p1 = adjustUnitsPoint(sh.p1);
    const p2 = adjustUnitsPoint(sh.p2);
    const { kind, id, labels } = sh;
    return {
      p1, p2,
      kind, id, labels
    };
  },

  point: (sh: Point) => adjustUnitsPoint(sh),

  rect: (sh: Rect) => {
    const [l, t, w, h] = sh.bounds;
    const x      = l / 100.0;
    const y      = t / 100.0;
    const width  = w / 100.0;
    const height = h / 100.0;
    const { kind, id, labels } = sh;
    return {
      bounds: [x, y, width, height],
      kind, id, labels
    };
  },

  trapezoid: (sh: Trapezoid) => {
    const topLeft = adjustUnitsPoint(sh.topLeft);
    const bottomLeft = adjustUnitsPoint(sh.bottomLeft);
    const topWidth = sh.topWidth / 100.0;
    const bottomWidth = sh.bottomWidth / 100.0;
    const { kind, id, labels } = sh;
    return {
      topLeft, topWidth,
      bottomLeft, bottomWidth,
      kind, id, labels
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
    const elem: SVGLineElement  = document.createElementNS("http://www.w3.org/2000/svg", "line");
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
    const elem  = document.createElementNS("http://www.w3.org/2000/svg", "rect");
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
    const elem: SVGPathElement  = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const p1 = sh.topLeft;
    const p2x = p1.x + sh.topWidth;
    const p2y = p1.y;
    const p3x = sh.bottomLeft.x + sh.bottomWidth;
    const p3y = sh.bottomLeft.y;
    const p4 = sh.bottomLeft;
    const  d = `M ${p1.x} ${p1.y} L ${p2x} ${p2y} L ${p3x} ${p3y} L ${p4.x} ${p4.y} Z`;
    elem.setAttribute("d", d);
    return elem;
  }
};

