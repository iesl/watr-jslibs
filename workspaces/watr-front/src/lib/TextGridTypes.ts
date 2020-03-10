// To parse this data:
//   const grid = Convert.toGrid(json);
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.


import * as coords from "./coord-sys";

export interface Grid {
  description: string;
  pages: Page[];
  fonts: Font[];
}

export interface Font {
  name: string;
  englishBigramEvidence: number;
  metrics: Metric[];
}

export interface Metric {
  scale: number;
  glyphsPerPage: Array<number[]>;
  heights: Heights;
}

export interface Heights {
  lowerCaseSmall: number;
  lowerCaseLarge: number;
  upperCase: number;
}

export interface Page {
  pageGeometry: coords.LTBoundsArray;
  textgrid: Textgrid;
}

export interface Textgrid {
  stableId: string;
  rows: Row[];
  labels: Labels;
}

export interface Labels {
  cellLabels: Array<Array<Array<CellLabelEnum | number>>>;
}

export enum CellLabelEnum {
  SegSub = "seg:Sub",
  SegSup = "seg:Sup",
}

export interface Row {
  offset: number;
  text: string;
  loci: Locus[];
}

/**

   Glyph Location Data takes these forms:
   Glyph:  {"g": [["d", 0, [10375, 17823, 684, 1071]]]  },
   Insert: {"i":  [" ", 0, [8066, 17823, 683, 1071]] },


*/
export type NumArray4 = [number, number, number, number];
export type BBoxArray = NumArray4;
type PageNum = number;
export type CharLocus = [string, PageNum, BBoxArray];

export interface Locus {
  g?: [CharLocus];
  i?: CharLocus;
}
export function locusIsGlyph(l: Locus): boolean {
  return l.g ? true : false;
}
export function locusCharLocus(l: Locus): CharLocus {
  return l.g ? l.g[0] : l.i!;
}

export function locusBBox(l: Locus): coords.BBox {
  const cl = locusCharLocus(l);
  return coords.mk.fromArray(cl[2]);
}
export function locusPage(l: Locus): number {
  const cl = locusCharLocus(l);
  return cl[1];
}
export function locusChar(l: Locus): string {
  const cl = locusCharLocus(l);
  return cl[0];
}

// export interface Locus {
//     g?: Array<Array<number[] | number | string>>;
//     i?: Array<number[] | number | string>;
// }

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
// export namespace Convert {
//     export function toGrid(json: string): Grid {
//         return cast(JSON.parse(json), r("Grid"));
//     }

//     export function gridToJson(value: Grid): string {
//         return JSON.stringify(uncast(value, r("Grid")), null, 2);
//     }

//     function invalidValue(typ: any, val: any): never {
//         throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`);
//     }

//     function jsonToJSProps(typ: any): any {
//         if (typ.jsonToJS === undefined) {
//             var map: any = {};
//             typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
//             typ.jsonToJS = map;
//         }
//         return typ.jsonToJS;
//     }

//     function jsToJSONProps(typ: any): any {
//         if (typ.jsToJSON === undefined) {
//             var map: any = {};
//             typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
//             typ.jsToJSON = map;
//         }
//         return typ.jsToJSON;
//     }

//     function transform(val: any, typ: any, getProps: any): any {
//         function transformPrimitive(typ: string, val: any): any {
//             if (typeof typ === typeof val) return val;
//             return invalidValue(typ, val);
//         }

//         function transformUnion(typs: any[], val: any): any {
//             // val must validate against one typ in typs
//             var l = typs.length;
//             for (var i = 0; i < l; i++) {
//                 var typ = typs[i];
//                 try {
//                     return transform(val, typ, getProps);
//                 } catch (_) {}
//             }
//             return invalidValue(typs, val);
//         }

//         function transformEnum(cases: string[], val: any): any {
//             if (cases.indexOf(val) !== -1) return val;
//             return invalidValue(cases, val);
//         }

//         function transformArray(typ: any, val: any): any {
//             // val must be an array with no invalid elements
//             if (!Array.isArray(val)) return invalidValue("array", val);
//             return val.map(el => transform(el, typ, getProps));
//         }

//         function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
//             if (val === null || typeof val !== "object" || Array.isArray(val)) {
//                 return invalidValue("object", val);
//             }
//             var result: any = {};
//             Object.getOwnPropertyNames(props).forEach(key => {
//                 const prop = props[key];
//                 const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
//                 result[prop.key] = transform(v, prop.typ, getProps);
//             });
//             Object.getOwnPropertyNames(val).forEach(key => {
//                 if (!Object.prototype.hasOwnProperty.call(props, key)) {
//                     result[key] = transform(val[key], additional, getProps);
//                 }
//             });
//             return result;
//         }

//         if (typ === "any") return val;
//         if (typ === null) {
//             if (val === null) return val;
//             return invalidValue(typ, val);
//         }
//         if (typ === false) return invalidValue(typ, val);
//         while (typeof typ === "object" && typ.ref !== undefined) {
//             typ = typeMap[typ.ref];
//         }
//         if (Array.isArray(typ)) return transformEnum(typ, val);
//         if (typeof typ === "object") {
//             return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
//                 : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
//                 : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
//                 : invalidValue(typ, val);
//         }
//         return transformPrimitive(typ, val);
//     }

//     function cast<T>(val: any, typ: any): T {
//         return transform(val, typ, jsonToJSProps);
//     }

//     function uncast<T>(val: T, typ: any): any {
//         return transform(val, typ, jsToJSONProps);
//     }

//     function a(typ: any) {
//         return { arrayItems: typ };
//     }

//     function u(...typs: any[]) {
//         return { unionMembers: typs };
//     }

//     function o(props: any[], additional: any) {
//         return { props, additional };
//     }

//     // function m(additional: any) {
//     //     return { props: [], additional };
//     // }

//     function r(name: string) {
//         return { ref: name };
//     }

//     const typeMap: any = {
//         "Grid": o([
//             { json: "description", js: "description", typ: "" },
//             { json: "pages", js: "pages", typ: a(r("Page")) },
//             { json: "fonts", js: "fonts", typ: a(r("Font")) },
//         ], false),
//         "Font": o([
//             { json: "name", js: "name", typ: "" },
//             { json: "englishBigramEvidence", js: "englishBigramEvidence", typ: 0 },
//             { json: "metrics", js: "metrics", typ: a(r("Metric")) },
//         ], false),
//         "Metric": o([
//             { json: "scale", js: "scale", typ: 0 },
//             { json: "glyphsPerPage", js: "glyphsPerPage", typ: a(a(0)) },
//             { json: "heights", js: "heights", typ: r("Heights") },
//         ], false),
//         "Heights": o([
//             { json: "lowerCaseSmall", js: "lowerCaseSmall", typ: 3.14 },
//             { json: "lowerCaseLarge", js: "lowerCaseLarge", typ: 3.14 },
//             { json: "upperCase", js: "upperCase", typ: 3.14 },
//         ], false),
//         "Page": o([
//             { json: "pageGeometry", js: "pageGeometry", typ: a(0) },
//             { json: "textgrid", js: "textgrid", typ: r("Textgrid") },
//         ], false),
//         "Textgrid": o([
//             { json: "stableId", js: "stableId", typ: "" },
//             { json: "rows", js: "rows", typ: a(r("Row")) },
//             { json: "labels", js: "labels", typ: r("Labels") },
//         ], false),
//         "Labels": o([
//             { json: "cellLabels", js: "cellLabels", typ: a(a(a(u(r("CellLabelEnum"), 0)))) },
//         ], false),
//         "Row": o([
//             { json: "offset", js: "offset", typ: 0 },
//             { json: "text", js: "text", typ: "" },
//             { json: "loci", js: "loci", typ: a(r("Locus")) },
//         ], false),
//         "Locus": o([
//             { json: "g", js: "g", typ: u(undefined, a(a(u(a(0), 0, "")))) },
//             { json: "i", js: "i", typ: u(undefined, a(u(a(0), 0, ""))) },
//         ], false),
//         "CellLabelEnum": [
//             "seg:Sub",
//             "seg:Sup",
//         ],
//     };
// }
