// To parse this data:
//
//   const grid = Convert.toGrid(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

/* tslint:disable: prefer-array-literal function-name no-var-keyword prefer-const */
import * as coords from "./coord-sys";
export let CellLabelEnum;

(function (CellLabelEnum) {
  CellLabelEnum["SegSub"] = "seg:Sub";
  CellLabelEnum["SegSup"] = "seg:Sup";
})(CellLabelEnum || (CellLabelEnum = {}));

export function locusIsGlyph(l) {
  return l.g ? true : false;
}
export function locusCharLocus(l) {
  return l.g ? l.g[0] : l.i;
}
export function locusBBox(l) {
  const cl = locusCharLocus(l);
  return coords.mk.fromArray(cl[2]);
}
export function locusPage(l) {
  const cl = locusCharLocus(l);
  return cl[1];
}
export function locusChar(l) {
  const cl = locusCharLocus(l);
  return cl[0];
} // export interface Locus {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9UZXh0R3JpZFR5cGVzLnRzIl0sIm5hbWVzIjpbImNvb3JkcyIsIkNlbGxMYWJlbEVudW0iLCJsb2N1c0lzR2x5cGgiLCJsIiwiZyIsImxvY3VzQ2hhckxvY3VzIiwiaSIsImxvY3VzQkJveCIsImNsIiwibWsiLCJmcm9tQXJyYXkiLCJsb2N1c1BhZ2UiLCJsb2N1c0NoYXIiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLE9BQU8sS0FBS0EsTUFBWixNQUF3QixhQUF4QjtBQTBDQSxXQUFZQyxhQUFaOztXQUFZQSxhO0FBQUFBLEVBQUFBLGE7QUFBQUEsRUFBQUEsYTtHQUFBQSxhLEtBQUFBLGE7O0FBMkJaLE9BQU8sU0FBU0MsWUFBVCxDQUFzQkMsQ0FBdEIsRUFBeUM7QUFDOUMsU0FBT0EsQ0FBQyxDQUFDQyxDQUFGLEdBQUssSUFBTCxHQUFZLEtBQW5CO0FBQ0Q7QUFDRCxPQUFPLFNBQVNDLGNBQVQsQ0FBd0JGLENBQXhCLEVBQTZDO0FBQ2xELFNBQU9BLENBQUMsQ0FBQ0MsQ0FBRixHQUFNRCxDQUFDLENBQUNDLENBQUYsQ0FBSSxDQUFKLENBQU4sR0FBZUQsQ0FBQyxDQUFDRyxDQUF4QjtBQUNEO0FBRUQsT0FBTyxTQUFTQyxTQUFULENBQW1CSixDQUFuQixFQUEwQztBQUMvQyxRQUFNSyxFQUFFLEdBQUdILGNBQWMsQ0FBQ0YsQ0FBRCxDQUF6QjtBQUNBLFNBQU9ILE1BQU0sQ0FBQ1MsRUFBUCxDQUFVQyxTQUFWLENBQW9CRixFQUFFLENBQUMsQ0FBRCxDQUF0QixDQUFQO0FBQ0Q7QUFDRCxPQUFPLFNBQVNHLFNBQVQsQ0FBbUJSLENBQW5CLEVBQXFDO0FBQzFDLFFBQU1LLEVBQUUsR0FBR0gsY0FBYyxDQUFDRixDQUFELENBQXpCO0FBQ0EsU0FBT0ssRUFBRSxDQUFDLENBQUQsQ0FBVDtBQUNEO0FBQ0QsT0FBTyxTQUFTSSxTQUFULENBQW1CVCxDQUFuQixFQUFxQztBQUMxQyxRQUFNSyxFQUFFLEdBQUdILGNBQWMsQ0FBQ0YsQ0FBRCxDQUF6QjtBQUNBLFNBQU9LLEVBQUUsQ0FBQyxDQUFELENBQVQ7QUFDRCxDLENBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIi8vIFRvIHBhcnNlIHRoaXMgZGF0YTpcbi8vXG4vLyAgIGNvbnN0IGdyaWQgPSBDb252ZXJ0LnRvR3JpZChqc29uKTtcbi8vXG4vLyBUaGVzZSBmdW5jdGlvbnMgd2lsbCB0aHJvdyBhbiBlcnJvciBpZiB0aGUgSlNPTiBkb2Vzbid0XG4vLyBtYXRjaCB0aGUgZXhwZWN0ZWQgaW50ZXJmYWNlLCBldmVuIGlmIHRoZSBKU09OIGlzIHZhbGlkLlxuXG4vKiB0c2xpbnQ6ZGlzYWJsZTogcHJlZmVyLWFycmF5LWxpdGVyYWwgZnVuY3Rpb24tbmFtZSBuby12YXIta2V5d29yZCBwcmVmZXItY29uc3QgKi9cbmltcG9ydCAqIGFzIGNvb3JkcyBmcm9tIFwiLi9jb29yZC1zeXNcIjtcblxuXG5leHBvcnQgaW50ZXJmYWNlIEdyaWQge1xuICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgcGFnZXM6ICAgICAgIFBhZ2VbXTtcbiAgICBmb250czogICAgICAgRm9udFtdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEZvbnQge1xuICAgIG5hbWU6ICAgICAgICAgICAgICAgICAgc3RyaW5nO1xuICAgIGVuZ2xpc2hCaWdyYW1FdmlkZW5jZTogbnVtYmVyO1xuICAgIG1ldHJpY3M6ICAgICAgICAgICAgICAgTWV0cmljW107XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTWV0cmljIHtcbiAgICBzY2FsZTogICAgICAgICBudW1iZXI7XG4gICAgZ2x5cGhzUGVyUGFnZTogQXJyYXk8bnVtYmVyW10+O1xuICAgIGhlaWdodHM6ICAgICAgIEhlaWdodHM7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSGVpZ2h0cyB7XG4gICAgbG93ZXJDYXNlU21hbGw6IG51bWJlcjtcbiAgICBsb3dlckNhc2VMYXJnZTogbnVtYmVyO1xuICAgIHVwcGVyQ2FzZTogICAgICBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGFnZSB7XG4gICAgcGFnZUdlb21ldHJ5OiBudW1iZXJbXTtcbiAgICB0ZXh0Z3JpZDogICAgIFRleHRncmlkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFRleHRncmlkIHtcbiAgICBzdGFibGVJZDogc3RyaW5nO1xuICAgIHJvd3M6ICAgICBSb3dbXTtcbiAgICBsYWJlbHM6ICAgTGFiZWxzO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIExhYmVscyB7XG4gICAgY2VsbExhYmVsczogQXJyYXk8QXJyYXk8QXJyYXk8Q2VsbExhYmVsRW51bSB8IG51bWJlcj4+Pjtcbn1cblxuZXhwb3J0IGVudW0gQ2VsbExhYmVsRW51bSB7XG4gICAgU2VnU3ViID0gXCJzZWc6U3ViXCIsXG4gICAgU2VnU3VwID0gXCJzZWc6U3VwXCIsXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUm93IHtcbiAgICBvZmZzZXQ6IG51bWJlcjtcbiAgICB0ZXh0OiAgIHN0cmluZztcbiAgICBsb2NpOiAgIExvY3VzW107XG59XG5cbi8qKlxuXG4gICBHbHlwaCBMb2NhdGlvbiBEYXRhIHRha2VzIHRoZXNlIGZvcm1zOlxuICAgICBHbHlwaDogIHtcImdcIjogW1tcImRcIiwgMCwgWzEwMzc1LCAxNzgyMywgNjg0LCAxMDcxXV1dICB9LFxuICAgICBJbnNlcnQ6IHtcImlcIjogIFtcIiBcIiwgMCwgWzgwNjYsIDE3ODIzLCA2ODMsIDEwNzFdXSB9LFxuXG5cbiovXG5leHBvcnQgdHlwZSBOdW1BcnJheTQgPSBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXTtcbmV4cG9ydCB0eXBlIEJCb3hBcnJheSA9IE51bUFycmF5NDtcbmV4cG9ydCB0eXBlIENoYXJMb2N1cyA9IFtzdHJpbmcsIG51bWJlciwgQkJveEFycmF5XTtcblxuZXhwb3J0IGludGVyZmFjZSBMb2N1cyB7XG4gIGc/OiBbIENoYXJMb2N1cyBdO1xuICBpPzogQ2hhckxvY3VzO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGxvY3VzSXNHbHlwaChsOiBMb2N1cyk6IGJvb2xlYW4ge1xuICByZXR1cm4gbC5nPyB0cnVlIDogZmFsc2U7XG59XG5leHBvcnQgZnVuY3Rpb24gbG9jdXNDaGFyTG9jdXMobDogTG9jdXMpOiBDaGFyTG9jdXMge1xuICByZXR1cm4gbC5nID8gbC5nWzBdIDogbC5pITtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvY3VzQkJveChsOiBMb2N1cyk6IGNvb3Jkcy5CQm94IHtcbiAgY29uc3QgY2wgPSBsb2N1c0NoYXJMb2N1cyhsKTtcbiAgcmV0dXJuIGNvb3Jkcy5tay5mcm9tQXJyYXkoY2xbMl0pO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGxvY3VzUGFnZShsOiBMb2N1cyk6IG51bWJlciB7XG4gIGNvbnN0IGNsID0gbG9jdXNDaGFyTG9jdXMobCk7XG4gIHJldHVybiBjbFsxXTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBsb2N1c0NoYXIobDogTG9jdXMpOiBzdHJpbmcge1xuICBjb25zdCBjbCA9IGxvY3VzQ2hhckxvY3VzKGwpO1xuICByZXR1cm4gY2xbMF07XG59XG5cbi8vIGV4cG9ydCBpbnRlcmZhY2UgTG9jdXMge1xuLy8gICAgIGc/OiBBcnJheTxBcnJheTxudW1iZXJbXSB8IG51bWJlciB8IHN0cmluZz4+O1xuLy8gICAgIGk/OiBBcnJheTxudW1iZXJbXSB8IG51bWJlciB8IHN0cmluZz47XG4vLyB9XG5cbi8vIENvbnZlcnRzIEpTT04gc3RyaW5ncyB0by9mcm9tIHlvdXIgdHlwZXNcbi8vIGFuZCBhc3NlcnRzIHRoZSByZXN1bHRzIG9mIEpTT04ucGFyc2UgYXQgcnVudGltZVxuLy8gZXhwb3J0IG5hbWVzcGFjZSBDb252ZXJ0IHtcbi8vICAgICBleHBvcnQgZnVuY3Rpb24gdG9HcmlkKGpzb246IHN0cmluZyk6IEdyaWQge1xuLy8gICAgICAgICByZXR1cm4gY2FzdChKU09OLnBhcnNlKGpzb24pLCByKFwiR3JpZFwiKSk7XG4vLyAgICAgfVxuXG4vLyAgICAgZXhwb3J0IGZ1bmN0aW9uIGdyaWRUb0pzb24odmFsdWU6IEdyaWQpOiBzdHJpbmcge1xuLy8gICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodW5jYXN0KHZhbHVlLCByKFwiR3JpZFwiKSksIG51bGwsIDIpO1xuLy8gICAgIH1cblxuLy8gICAgIGZ1bmN0aW9uIGludmFsaWRWYWx1ZSh0eXA6IGFueSwgdmFsOiBhbnkpOiBuZXZlciB7XG4vLyAgICAgICAgIHRocm93IEVycm9yKGBJbnZhbGlkIHZhbHVlICR7SlNPTi5zdHJpbmdpZnkodmFsKX0gZm9yIHR5cGUgJHtKU09OLnN0cmluZ2lmeSh0eXApfWApO1xuLy8gICAgIH1cblxuLy8gICAgIGZ1bmN0aW9uIGpzb25Ub0pTUHJvcHModHlwOiBhbnkpOiBhbnkge1xuLy8gICAgICAgICBpZiAodHlwLmpzb25Ub0pTID09PSB1bmRlZmluZWQpIHtcbi8vICAgICAgICAgICAgIHZhciBtYXA6IGFueSA9IHt9O1xuLy8gICAgICAgICAgICAgdHlwLnByb3BzLmZvckVhY2goKHA6IGFueSkgPT4gbWFwW3AuanNvbl0gPSB7IGtleTogcC5qcywgdHlwOiBwLnR5cCB9KTtcbi8vICAgICAgICAgICAgIHR5cC5qc29uVG9KUyA9IG1hcDtcbi8vICAgICAgICAgfVxuLy8gICAgICAgICByZXR1cm4gdHlwLmpzb25Ub0pTO1xuLy8gICAgIH1cblxuLy8gICAgIGZ1bmN0aW9uIGpzVG9KU09OUHJvcHModHlwOiBhbnkpOiBhbnkge1xuLy8gICAgICAgICBpZiAodHlwLmpzVG9KU09OID09PSB1bmRlZmluZWQpIHtcbi8vICAgICAgICAgICAgIHZhciBtYXA6IGFueSA9IHt9O1xuLy8gICAgICAgICAgICAgdHlwLnByb3BzLmZvckVhY2goKHA6IGFueSkgPT4gbWFwW3AuanNdID0geyBrZXk6IHAuanNvbiwgdHlwOiBwLnR5cCB9KTtcbi8vICAgICAgICAgICAgIHR5cC5qc1RvSlNPTiA9IG1hcDtcbi8vICAgICAgICAgfVxuLy8gICAgICAgICByZXR1cm4gdHlwLmpzVG9KU09OO1xuLy8gICAgIH1cblxuLy8gICAgIGZ1bmN0aW9uIHRyYW5zZm9ybSh2YWw6IGFueSwgdHlwOiBhbnksIGdldFByb3BzOiBhbnkpOiBhbnkge1xuLy8gICAgICAgICBmdW5jdGlvbiB0cmFuc2Zvcm1QcmltaXRpdmUodHlwOiBzdHJpbmcsIHZhbDogYW55KTogYW55IHtcbi8vICAgICAgICAgICAgIGlmICh0eXBlb2YgdHlwID09PSB0eXBlb2YgdmFsKSByZXR1cm4gdmFsO1xuLy8gICAgICAgICAgICAgcmV0dXJuIGludmFsaWRWYWx1ZSh0eXAsIHZhbCk7XG4vLyAgICAgICAgIH1cblxuLy8gICAgICAgICBmdW5jdGlvbiB0cmFuc2Zvcm1Vbmlvbih0eXBzOiBhbnlbXSwgdmFsOiBhbnkpOiBhbnkge1xuLy8gICAgICAgICAgICAgLy8gdmFsIG11c3QgdmFsaWRhdGUgYWdhaW5zdCBvbmUgdHlwIGluIHR5cHNcbi8vICAgICAgICAgICAgIHZhciBsID0gdHlwcy5sZW5ndGg7XG4vLyAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuLy8gICAgICAgICAgICAgICAgIHZhciB0eXAgPSB0eXBzW2ldO1xuLy8gICAgICAgICAgICAgICAgIHRyeSB7XG4vLyAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm0odmFsLCB0eXAsIGdldFByb3BzKTtcbi8vICAgICAgICAgICAgICAgICB9IGNhdGNoIChfKSB7fVxuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgcmV0dXJuIGludmFsaWRWYWx1ZSh0eXBzLCB2YWwpO1xuLy8gICAgICAgICB9XG5cbi8vICAgICAgICAgZnVuY3Rpb24gdHJhbnNmb3JtRW51bShjYXNlczogc3RyaW5nW10sIHZhbDogYW55KTogYW55IHtcbi8vICAgICAgICAgICAgIGlmIChjYXNlcy5pbmRleE9mKHZhbCkgIT09IC0xKSByZXR1cm4gdmFsO1xuLy8gICAgICAgICAgICAgcmV0dXJuIGludmFsaWRWYWx1ZShjYXNlcywgdmFsKTtcbi8vICAgICAgICAgfVxuXG4vLyAgICAgICAgIGZ1bmN0aW9uIHRyYW5zZm9ybUFycmF5KHR5cDogYW55LCB2YWw6IGFueSk6IGFueSB7XG4vLyAgICAgICAgICAgICAvLyB2YWwgbXVzdCBiZSBhbiBhcnJheSB3aXRoIG5vIGludmFsaWQgZWxlbWVudHNcbi8vICAgICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheSh2YWwpKSByZXR1cm4gaW52YWxpZFZhbHVlKFwiYXJyYXlcIiwgdmFsKTtcbi8vICAgICAgICAgICAgIHJldHVybiB2YWwubWFwKGVsID0+IHRyYW5zZm9ybShlbCwgdHlwLCBnZXRQcm9wcykpO1xuLy8gICAgICAgICB9XG5cbi8vICAgICAgICAgZnVuY3Rpb24gdHJhbnNmb3JtT2JqZWN0KHByb3BzOiB7IFtrOiBzdHJpbmddOiBhbnkgfSwgYWRkaXRpb25hbDogYW55LCB2YWw6IGFueSk6IGFueSB7XG4vLyAgICAgICAgICAgICBpZiAodmFsID09PSBudWxsIHx8IHR5cGVvZiB2YWwgIT09IFwib2JqZWN0XCIgfHwgQXJyYXkuaXNBcnJheSh2YWwpKSB7XG4vLyAgICAgICAgICAgICAgICAgcmV0dXJuIGludmFsaWRWYWx1ZShcIm9iamVjdFwiLCB2YWwpO1xuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgdmFyIHJlc3VsdDogYW55ID0ge307XG4vLyAgICAgICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhwcm9wcykuZm9yRWFjaChrZXkgPT4ge1xuLy8gICAgICAgICAgICAgICAgIGNvbnN0IHByb3AgPSBwcm9wc1trZXldO1xuLy8gICAgICAgICAgICAgICAgIGNvbnN0IHYgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodmFsLCBrZXkpID8gdmFsW2tleV0gOiB1bmRlZmluZWQ7XG4vLyAgICAgICAgICAgICAgICAgcmVzdWx0W3Byb3Aua2V5XSA9IHRyYW5zZm9ybSh2LCBwcm9wLnR5cCwgZ2V0UHJvcHMpO1xuLy8gICAgICAgICAgICAgfSk7XG4vLyAgICAgICAgICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWwpLmZvckVhY2goa2V5ID0+IHtcbi8vICAgICAgICAgICAgICAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChwcm9wcywga2V5KSkge1xuLy8gICAgICAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHRyYW5zZm9ybSh2YWxba2V5XSwgYWRkaXRpb25hbCwgZ2V0UHJvcHMpO1xuLy8gICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgIH0pO1xuLy8gICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbi8vICAgICAgICAgfVxuXG4vLyAgICAgICAgIGlmICh0eXAgPT09IFwiYW55XCIpIHJldHVybiB2YWw7XG4vLyAgICAgICAgIGlmICh0eXAgPT09IG51bGwpIHtcbi8vICAgICAgICAgICAgIGlmICh2YWwgPT09IG51bGwpIHJldHVybiB2YWw7XG4vLyAgICAgICAgICAgICByZXR1cm4gaW52YWxpZFZhbHVlKHR5cCwgdmFsKTtcbi8vICAgICAgICAgfVxuLy8gICAgICAgICBpZiAodHlwID09PSBmYWxzZSkgcmV0dXJuIGludmFsaWRWYWx1ZSh0eXAsIHZhbCk7XG4vLyAgICAgICAgIHdoaWxlICh0eXBlb2YgdHlwID09PSBcIm9iamVjdFwiICYmIHR5cC5yZWYgIT09IHVuZGVmaW5lZCkge1xuLy8gICAgICAgICAgICAgdHlwID0gdHlwZU1hcFt0eXAucmVmXTtcbi8vICAgICAgICAgfVxuLy8gICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh0eXApKSByZXR1cm4gdHJhbnNmb3JtRW51bSh0eXAsIHZhbCk7XG4vLyAgICAgICAgIGlmICh0eXBlb2YgdHlwID09PSBcIm9iamVjdFwiKSB7XG4vLyAgICAgICAgICAgICByZXR1cm4gdHlwLmhhc093blByb3BlcnR5KFwidW5pb25NZW1iZXJzXCIpID8gdHJhbnNmb3JtVW5pb24odHlwLnVuaW9uTWVtYmVycywgdmFsKVxuLy8gICAgICAgICAgICAgICAgIDogdHlwLmhhc093blByb3BlcnR5KFwiYXJyYXlJdGVtc1wiKSAgICA/IHRyYW5zZm9ybUFycmF5KHR5cC5hcnJheUl0ZW1zLCB2YWwpXG4vLyAgICAgICAgICAgICAgICAgOiB0eXAuaGFzT3duUHJvcGVydHkoXCJwcm9wc1wiKSAgICAgICAgID8gdHJhbnNmb3JtT2JqZWN0KGdldFByb3BzKHR5cCksIHR5cC5hZGRpdGlvbmFsLCB2YWwpXG4vLyAgICAgICAgICAgICAgICAgOiBpbnZhbGlkVmFsdWUodHlwLCB2YWwpO1xuLy8gICAgICAgICB9XG4vLyAgICAgICAgIHJldHVybiB0cmFuc2Zvcm1QcmltaXRpdmUodHlwLCB2YWwpO1xuLy8gICAgIH1cblxuLy8gICAgIGZ1bmN0aW9uIGNhc3Q8VD4odmFsOiBhbnksIHR5cDogYW55KTogVCB7XG4vLyAgICAgICAgIHJldHVybiB0cmFuc2Zvcm0odmFsLCB0eXAsIGpzb25Ub0pTUHJvcHMpO1xuLy8gICAgIH1cblxuLy8gICAgIGZ1bmN0aW9uIHVuY2FzdDxUPih2YWw6IFQsIHR5cDogYW55KTogYW55IHtcbi8vICAgICAgICAgcmV0dXJuIHRyYW5zZm9ybSh2YWwsIHR5cCwganNUb0pTT05Qcm9wcyk7XG4vLyAgICAgfVxuXG4vLyAgICAgZnVuY3Rpb24gYSh0eXA6IGFueSkge1xuLy8gICAgICAgICByZXR1cm4geyBhcnJheUl0ZW1zOiB0eXAgfTtcbi8vICAgICB9XG5cbi8vICAgICBmdW5jdGlvbiB1KC4uLnR5cHM6IGFueVtdKSB7XG4vLyAgICAgICAgIHJldHVybiB7IHVuaW9uTWVtYmVyczogdHlwcyB9O1xuLy8gICAgIH1cblxuLy8gICAgIGZ1bmN0aW9uIG8ocHJvcHM6IGFueVtdLCBhZGRpdGlvbmFsOiBhbnkpIHtcbi8vICAgICAgICAgcmV0dXJuIHsgcHJvcHMsIGFkZGl0aW9uYWwgfTtcbi8vICAgICB9XG5cbi8vICAgICAvLyBmdW5jdGlvbiBtKGFkZGl0aW9uYWw6IGFueSkge1xuLy8gICAgIC8vICAgICByZXR1cm4geyBwcm9wczogW10sIGFkZGl0aW9uYWwgfTtcbi8vICAgICAvLyB9XG5cbi8vICAgICBmdW5jdGlvbiByKG5hbWU6IHN0cmluZykge1xuLy8gICAgICAgICByZXR1cm4geyByZWY6IG5hbWUgfTtcbi8vICAgICB9XG5cbi8vICAgICBjb25zdCB0eXBlTWFwOiBhbnkgPSB7XG4vLyAgICAgICAgIFwiR3JpZFwiOiBvKFtcbi8vICAgICAgICAgICAgIHsganNvbjogXCJkZXNjcmlwdGlvblwiLCBqczogXCJkZXNjcmlwdGlvblwiLCB0eXA6IFwiXCIgfSxcbi8vICAgICAgICAgICAgIHsganNvbjogXCJwYWdlc1wiLCBqczogXCJwYWdlc1wiLCB0eXA6IGEocihcIlBhZ2VcIikpIH0sXG4vLyAgICAgICAgICAgICB7IGpzb246IFwiZm9udHNcIiwganM6IFwiZm9udHNcIiwgdHlwOiBhKHIoXCJGb250XCIpKSB9LFxuLy8gICAgICAgICBdLCBmYWxzZSksXG4vLyAgICAgICAgIFwiRm9udFwiOiBvKFtcbi8vICAgICAgICAgICAgIHsganNvbjogXCJuYW1lXCIsIGpzOiBcIm5hbWVcIiwgdHlwOiBcIlwiIH0sXG4vLyAgICAgICAgICAgICB7IGpzb246IFwiZW5nbGlzaEJpZ3JhbUV2aWRlbmNlXCIsIGpzOiBcImVuZ2xpc2hCaWdyYW1FdmlkZW5jZVwiLCB0eXA6IDAgfSxcbi8vICAgICAgICAgICAgIHsganNvbjogXCJtZXRyaWNzXCIsIGpzOiBcIm1ldHJpY3NcIiwgdHlwOiBhKHIoXCJNZXRyaWNcIikpIH0sXG4vLyAgICAgICAgIF0sIGZhbHNlKSxcbi8vICAgICAgICAgXCJNZXRyaWNcIjogbyhbXG4vLyAgICAgICAgICAgICB7IGpzb246IFwic2NhbGVcIiwganM6IFwic2NhbGVcIiwgdHlwOiAwIH0sXG4vLyAgICAgICAgICAgICB7IGpzb246IFwiZ2x5cGhzUGVyUGFnZVwiLCBqczogXCJnbHlwaHNQZXJQYWdlXCIsIHR5cDogYShhKDApKSB9LFxuLy8gICAgICAgICAgICAgeyBqc29uOiBcImhlaWdodHNcIiwganM6IFwiaGVpZ2h0c1wiLCB0eXA6IHIoXCJIZWlnaHRzXCIpIH0sXG4vLyAgICAgICAgIF0sIGZhbHNlKSxcbi8vICAgICAgICAgXCJIZWlnaHRzXCI6IG8oW1xuLy8gICAgICAgICAgICAgeyBqc29uOiBcImxvd2VyQ2FzZVNtYWxsXCIsIGpzOiBcImxvd2VyQ2FzZVNtYWxsXCIsIHR5cDogMy4xNCB9LFxuLy8gICAgICAgICAgICAgeyBqc29uOiBcImxvd2VyQ2FzZUxhcmdlXCIsIGpzOiBcImxvd2VyQ2FzZUxhcmdlXCIsIHR5cDogMy4xNCB9LFxuLy8gICAgICAgICAgICAgeyBqc29uOiBcInVwcGVyQ2FzZVwiLCBqczogXCJ1cHBlckNhc2VcIiwgdHlwOiAzLjE0IH0sXG4vLyAgICAgICAgIF0sIGZhbHNlKSxcbi8vICAgICAgICAgXCJQYWdlXCI6IG8oW1xuLy8gICAgICAgICAgICAgeyBqc29uOiBcInBhZ2VHZW9tZXRyeVwiLCBqczogXCJwYWdlR2VvbWV0cnlcIiwgdHlwOiBhKDApIH0sXG4vLyAgICAgICAgICAgICB7IGpzb246IFwidGV4dGdyaWRcIiwganM6IFwidGV4dGdyaWRcIiwgdHlwOiByKFwiVGV4dGdyaWRcIikgfSxcbi8vICAgICAgICAgXSwgZmFsc2UpLFxuLy8gICAgICAgICBcIlRleHRncmlkXCI6IG8oW1xuLy8gICAgICAgICAgICAgeyBqc29uOiBcInN0YWJsZUlkXCIsIGpzOiBcInN0YWJsZUlkXCIsIHR5cDogXCJcIiB9LFxuLy8gICAgICAgICAgICAgeyBqc29uOiBcInJvd3NcIiwganM6IFwicm93c1wiLCB0eXA6IGEocihcIlJvd1wiKSkgfSxcbi8vICAgICAgICAgICAgIHsganNvbjogXCJsYWJlbHNcIiwganM6IFwibGFiZWxzXCIsIHR5cDogcihcIkxhYmVsc1wiKSB9LFxuLy8gICAgICAgICBdLCBmYWxzZSksXG4vLyAgICAgICAgIFwiTGFiZWxzXCI6IG8oW1xuLy8gICAgICAgICAgICAgeyBqc29uOiBcImNlbGxMYWJlbHNcIiwganM6IFwiY2VsbExhYmVsc1wiLCB0eXA6IGEoYShhKHUocihcIkNlbGxMYWJlbEVudW1cIiksIDApKSkpIH0sXG4vLyAgICAgICAgIF0sIGZhbHNlKSxcbi8vICAgICAgICAgXCJSb3dcIjogbyhbXG4vLyAgICAgICAgICAgICB7IGpzb246IFwib2Zmc2V0XCIsIGpzOiBcIm9mZnNldFwiLCB0eXA6IDAgfSxcbi8vICAgICAgICAgICAgIHsganNvbjogXCJ0ZXh0XCIsIGpzOiBcInRleHRcIiwgdHlwOiBcIlwiIH0sXG4vLyAgICAgICAgICAgICB7IGpzb246IFwibG9jaVwiLCBqczogXCJsb2NpXCIsIHR5cDogYShyKFwiTG9jdXNcIikpIH0sXG4vLyAgICAgICAgIF0sIGZhbHNlKSxcbi8vICAgICAgICAgXCJMb2N1c1wiOiBvKFtcbi8vICAgICAgICAgICAgIHsganNvbjogXCJnXCIsIGpzOiBcImdcIiwgdHlwOiB1KHVuZGVmaW5lZCwgYShhKHUoYSgwKSwgMCwgXCJcIikpKSkgfSxcbi8vICAgICAgICAgICAgIHsganNvbjogXCJpXCIsIGpzOiBcImlcIiwgdHlwOiB1KHVuZGVmaW5lZCwgYSh1KGEoMCksIDAsIFwiXCIpKSkgfSxcbi8vICAgICAgICAgXSwgZmFsc2UpLFxuLy8gICAgICAgICBcIkNlbGxMYWJlbEVudW1cIjogW1xuLy8gICAgICAgICAgICAgXCJzZWc6U3ViXCIsXG4vLyAgICAgICAgICAgICBcInNlZzpTdXBcIixcbi8vICAgICAgICAgXSxcbi8vICAgICB9O1xuLy8gfVxuXG5cblxuIl19