/**
 * Define and translate between the various coordinate systems used:
 *
 *
 *    PDF Media coords - (PDF-extracted page geometry and char bounding boxes)
 *    Single-Page Image coords - coords within the svg containing page image, scaled version of Media coords
 *    Screen event coords - e.g., where a user clicks on a page
 *    Client Pages View  - Absolute coords within the vertical scroll
 *                         list of page svgs/images (regardless of scroll position)
 *    Client Text View  - coords within the vertical scroll list of page text blocks  (regardless of scroll position)
 *
 *    event page/client/screen/offset explanations:
 *       https://stackoverflow.com/questions/6073505/what-is-the-difference-between-screenx-y-clientx-y-and-pagex-y
 */
export declare enum CoordSys {
    Unknown = 0,
    Screen = 1,
    Div = 2,
    GraphUnits = 3,
    PdfMedia = 4
}
interface ILTBoundsIntRep {
    left: number;
    top: number;
    width: number;
    height: number;
}
export interface ILTBounds {
    left: number;
    top: number;
    width: number;
    height: number;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    x: number;
    y: number;
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    bottom: number;
    right: number;
    topLeft: Point;
}
export declare class Point {
    x: number;
    y: number;
    sys: CoordSys;
    constructor(x: number, y: number, sys: CoordSys);
    svgShape(): {
        type: string;
        r: number;
        cx: number;
        cy: number;
    };
}
declare class Line {
    p1: Point;
    p2: Point;
    sys: CoordSys;
    constructor(p1: Point, p2: Point);
    svgShape(): {
        type: string;
        x1: number;
        x2: number;
        y1: number;
        y2: number;
    };
}
declare class Trapezoid {
    topLine: Line;
    bottomLine: Line;
    constructor(top: Line, bottom: Line);
    svgShape(): {
        type: string;
        d: string;
    };
}
export declare type AnyShape = Point | Line | Trapezoid | BBox;
export declare let mkPoint: {
    fromXy: (x: number, y: number, sys?: CoordSys) => Point;
    fromD3Mouse: (d3Mouse: [number, number]) => Point;
    offsetFromJqEvent: (event: any) => Point;
    fromFloatReps: (o: any) => Point;
};
export declare function pointFloor(p: Point): Point;
/**
 *  General purpose bounding box data that meets the interface requirements
 *  for the various libraries in use
 */
export declare class BBox implements ILTBounds {
    left: number;
    top: number;
    width: number;
    height: number;
    sys: CoordSys;
    constructor(l: number, t: number, w: number, h: number, sys?: CoordSys);
    readonly minX: number;
    readonly minY: number;
    readonly maxX: number;
    readonly maxY: number;
    readonly x: number;
    readonly y: number;
    readonly x1: number;
    readonly x2: number;
    readonly y1: number;
    readonly y2: number;
    readonly bottom: number;
    readonly right: number;
    readonly topLeft: Point;
    readonly centerPoint: Point;
    readonly intRep: number[];
    toString(): string;
    svgShape(): {
        type: string;
        x: number;
        y: number;
        width: number;
        height: number;
    };
}
export declare let mk: {
    fromLtwhFloatReps: (o: ILTBoundsIntRep) => BBox;
    fromLtwh: (l: number, t: number, w: number, h: number) => BBox;
    fromLtwhObj: (o: ILTBounds) => BBox;
    fromArray: (ltwh: [number, number, number, number]) => BBox;
};
export declare function boxCenteredAt(p: Point, width: number, height: number): BBox;
export declare function fromFigure(fig: any): AnyShape;
export {};
