/**
 *
 */
import { Selection, BaseType } from "d3-selection";
import 'd3-transition';
import { BBox } from './coord-sys';
export declare function initRect<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(sel: Selection<GElement, Datum, PElement, PDatum>, fbbox: (d: any) => BBox): void;
export declare function initStroke<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(sel: Selection<GElement, Datum, PElement, PDatum>, stroke: string, strokeWidth: number, strokeOpacity: number): void;
export declare function initFill<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(sel: Selection<GElement, Datum, PElement, PDatum>, fill: string, fillOpacity: number): void;
export declare let d3select: {
    pageTextgridSvg: (n: number) => Selection<BaseType, unknown, HTMLElement, any>;
};
export declare function getId(data: any): any;
export declare function d3id<GElement extends BaseType>(selector: string): Selection<GElement, any, HTMLElement, any>;
export declare function stepThrough(interpFunc: any, steps: any): void;
