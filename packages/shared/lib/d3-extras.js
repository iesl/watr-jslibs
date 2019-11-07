/**
 *
 */
// import * as d3 from 'd3';
import { select } from "d3-selection";
import 'd3-transition';
// Sel Elem type, Sel Data Type, Parent Elem type, parent data type
// type D3Selection = Selection<BaseType, any, HTMLElement, any>;
// type D3Selection = Selection;
// export interface Selection<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> {
export function initRect(sel, fbbox) {
  sel.attr("x", d => fbbox(d).left).attr("y", d => fbbox(d).top).attr("width", d => fbbox(d).width).attr("height", d => fbbox(d).height);
}
export function initStroke(sel, stroke, strokeWidth, strokeOpacity) {
  sel.attr("stroke", stroke).attr("stroke-width", strokeWidth).attr("stroke-opacity", strokeOpacity);
}
export function initFill(sel, fill, fillOpacity) {
  sel.attr("fill", fill).attr("fill-opacity", fillOpacity);
}
export let d3select = {
  pageTextgridSvg: n => {
    return select('div.page-textgrids').select(`svg#textgrid-svg-${n}`);
  }
};
export function getId(data) {
  const shape = data.type;

  if (data.id !== undefined) {
    return data.id;
  }

  switch (shape) {
    case "rect":
      return `r_${data.x}_${data.y}_${data.width}_${data.height}`;

    case "circle":
      return `c_${data.cx}_${data.cy}_${data.r}`;

    case "line":
      return `l_${data.x1}_${data.y1}_${data.x2}_${data.y2}`;

    default:
      return "";
  }
} // export function select<GElement extends BaseType, OldDatum>(selector: string): Selection<GElement, OldDatum, HTMLElement, any>;

export function d3id(selector) {
  return select(`#${selector}`);
}
/**
 *
 * Allow sequencing of d3 animations by waiting for all transitions to end before moving to the next "step"
 *
 */

function onEndAll(transition, callback) {
  if (transition.empty()) {
    callback();
  } else {
    let n = transition.size();
    transition.on("end", () => {
      n = n - 1;

      if (n === 0) {
        callback();
      }
    });
  }
}

export function stepThrough(interpFunc, steps) {
  if (steps.length > 0) {
    const step = steps[0];
    interpFunc(step).transition().delay(300).call(onEndAll, () => {
      stepThrough(interpFunc, steps.slice(1));
    });
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kMy1leHRyYXMudHMiXSwibmFtZXMiOlsic2VsZWN0IiwiaW5pdFJlY3QiLCJzZWwiLCJmYmJveCIsImF0dHIiLCJkIiwibGVmdCIsInRvcCIsIndpZHRoIiwiaGVpZ2h0IiwiaW5pdFN0cm9rZSIsInN0cm9rZSIsInN0cm9rZVdpZHRoIiwic3Ryb2tlT3BhY2l0eSIsImluaXRGaWxsIiwiZmlsbCIsImZpbGxPcGFjaXR5IiwiZDNzZWxlY3QiLCJwYWdlVGV4dGdyaWRTdmciLCJuIiwiZ2V0SWQiLCJkYXRhIiwic2hhcGUiLCJ0eXBlIiwiaWQiLCJ1bmRlZmluZWQiLCJ4IiwieSIsImN4IiwiY3kiLCJyIiwieDEiLCJ5MSIsIngyIiwieTIiLCJkM2lkIiwic2VsZWN0b3IiLCJvbkVuZEFsbCIsInRyYW5zaXRpb24iLCJjYWxsYmFjayIsImVtcHR5Iiwic2l6ZSIsIm9uIiwic3RlcFRocm91Z2giLCJpbnRlcnBGdW5jIiwic3RlcHMiLCJsZW5ndGgiLCJzdGVwIiwiZGVsYXkiLCJjYWxsIiwic2xpY2UiXSwibWFwcGluZ3MiOiJBQUFBOzs7QUFJQTtBQUNBLFNBR0VBLE1BSEYsUUFJTyxjQUpQO0FBTUEsT0FBTyxlQUFQO0FBSUE7QUFDQTtBQUNBO0FBQ0E7QUFFQSxPQUFPLFNBQVNDLFFBQVQsQ0FDTEMsR0FESyxFQUVMQyxLQUZLLEVBR0w7QUFDRUQsRUFBQUEsR0FBRyxDQUFFRSxJQUFMLENBQVUsR0FBVixFQUFxQkMsQ0FBQyxJQUFJRixLQUFLLENBQUNFLENBQUQsQ0FBTCxDQUFTQyxJQUFuQyxFQUNLRixJQURMLENBQ1UsR0FEVixFQUNxQkMsQ0FBQyxJQUFJRixLQUFLLENBQUNFLENBQUQsQ0FBTCxDQUFTRSxHQURuQyxFQUVLSCxJQUZMLENBRVUsT0FGVixFQUVxQkMsQ0FBQyxJQUFJRixLQUFLLENBQUNFLENBQUQsQ0FBTCxDQUFTRyxLQUZuQyxFQUdLSixJQUhMLENBR1UsUUFIVixFQUdxQkMsQ0FBQyxJQUFJRixLQUFLLENBQUNF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LENBQVksQ0FBWixDQUFiLENBQVg7QUFDRCxLQUxIO0FBTUQ7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICpcbiAqL1xuXG4vLyBpbXBvcnQgKiBhcyBkMyBmcm9tICdkMyc7XG5pbXBvcnQge1xuICBTZWxlY3Rpb24sXG4gIEJhc2VUeXBlLFxuICBzZWxlY3Rcbn0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuXG5pbXBvcnQgJ2QzLXRyYW5zaXRpb24nO1xuXG5pbXBvcnQgeyBCQm94IH0gZnJvbSAnLi9jb29yZC1zeXMnO1xuXG4vLyBTZWwgRWxlbSB0eXBlLCBTZWwgRGF0YSBUeXBlLCBQYXJlbnQgRWxlbSB0eXBlLCBwYXJlbnQgZGF0YSB0eXBlXG4vLyB0eXBlIEQzU2VsZWN0aW9uID0gU2VsZWN0aW9uPEJhc2VUeXBlLCBhbnksIEhUTUxFbGVtZW50LCBhbnk+O1xuLy8gdHlwZSBEM1NlbGVjdGlvbiA9IFNlbGVjdGlvbjtcbi8vIGV4cG9ydCBpbnRlcmZhY2UgU2VsZWN0aW9uPEdFbGVtZW50IGV4dGVuZHMgQmFzZVR5cGUsIERhdHVtLCBQRWxlbWVudCBleHRlbmRzIEJhc2VUeXBlLCBQRGF0dW0+IHtcblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRSZWN0IDxHRWxlbWVudCBleHRlbmRzIEJhc2VUeXBlLCBEYXR1bSwgUEVsZW1lbnQgZXh0ZW5kcyBCYXNlVHlwZSwgUERhdHVtPiAoXG4gIHNlbDogU2VsZWN0aW9uPEdFbGVtZW50LCBEYXR1bSwgUEVsZW1lbnQsIFBEYXR1bT4sXG4gIGZiYm94OiAoZDogYW55KSA9PiBCQm94XG4pIHtcbiAgICBzZWwgLmF0dHIoXCJ4XCIgICAgICAsIGQgPT4gZmJib3goZCkubGVmdClcbiAgICAgICAgLmF0dHIoXCJ5XCIgICAgICAsIGQgPT4gZmJib3goZCkudG9wKVxuICAgICAgICAuYXR0cihcIndpZHRoXCIgICwgZCA9PiBmYmJveChkKS53aWR0aClcbiAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiAsIGQgPT4gZmJib3goZCkuaGVpZ2h0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRTdHJva2UgPEdFbGVtZW50IGV4dGVuZHMgQmFzZVR5cGUsIERhdHVtLCBQRWxlbWVudCBleHRlbmRzIEJhc2VUeXBlLCBQRGF0dW0+IChcbiAgc2VsOiBTZWxlY3Rpb248R0VsZW1lbnQsIERhdHVtLCBQRWxlbWVudCwgUERhdHVtPixcbiAgc3Ryb2tlOiBzdHJpbmcsIHN0cm9rZVdpZHRoOiBudW1iZXIsIHN0cm9rZU9wYWNpdHk6IG51bWJlcikge1xuICAgIHNlbCAuYXR0cihcInN0cm9rZVwiLCBzdHJva2UpXG4gICAgICAgIC5hdHRyKFwic3Ryb2tlLXdpZHRoXCIsIHN0cm9rZVdpZHRoKVxuICAgICAgICAuYXR0cihcInN0cm9rZS1vcGFjaXR5XCIsIHN0cm9rZU9wYWNpdHkpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGluaXRGaWxsIDxHRWxlbWVudCBleHRlbmRzIEJhc2VUeXBlLCBEYXR1bSwgUEVsZW1lbnQgZXh0ZW5kcyBCYXNlVHlwZSwgUERhdHVtPiAoXG4gICAgc2VsOiBTZWxlY3Rpb248R0VsZW1lbnQsIERhdHVtLCBQRWxlbWVudCwgUERhdHVtPixcbiAgZmlsbDogc3RyaW5nLCBmaWxsT3BhY2l0eTogbnVtYmVyXG4pIHtcbiAgICBzZWwgLmF0dHIoXCJmaWxsXCIsIGZpbGwpXG4gICAgICAgIC5hdHRyKFwiZmlsbC1vcGFjaXR5XCIsIGZpbGxPcGFjaXR5KTtcbn1cblxuZXhwb3J0IGxldCBkM3NlbGVjdCA9IHtcbiAgcGFnZVRleHRncmlkU3ZnOiAobjogbnVtYmVyKSA9PiB7XG4gICAgICAgIHJldHVybiBzZWxlY3QoJ2Rpdi5wYWdlLXRleHRncmlkcycpLnNlbGVjdChgc3ZnI3RleHRncmlkLXN2Zy0ke259YCk7XG4gICAgfSxcbn07XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldElkKGRhdGE6IGFueSkge1xuICBjb25zdCBzaGFwZSA9IGRhdGEudHlwZTtcblxuICBpZiAoZGF0YS5pZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGRhdGEuaWQ7XG4gIH1cbiAgc3dpdGNoIChzaGFwZSkge1xuICAgIGNhc2UgXCJyZWN0XCI6XG4gICAgICByZXR1cm4gYHJfJHtkYXRhLnh9XyR7ZGF0YS55fV8ke2RhdGEud2lkdGh9XyR7ZGF0YS5oZWlnaHR9YDtcbiAgICBjYXNlIFwiY2lyY2xlXCI6XG4gICAgICByZXR1cm4gYGNfJHtkYXRhLmN4fV8ke2RhdGEuY3l9XyR7ZGF0YS5yfWA7XG4gICAgY2FzZSBcImxpbmVcIjpcbiAgICAgIHJldHVybiBgbF8ke2RhdGEueDF9XyR7ZGF0YS55MX1fJHtkYXRhLngyfV8ke2RhdGEueTJ9YDtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFwiXCI7XG4gIH1cbn1cblxuLy8gZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdDxHRWxlbWVudCBleHRlbmRzIEJhc2VUeXBlLCBPbGREYXR1bT4oc2VsZWN0b3I6IHN0cmluZyk6IFNlbGVjdGlvbjxHRWxlbWVudCwgT2xkRGF0dW0sIEhUTUxFbGVtZW50LCBhbnk+O1xuZXhwb3J0IGZ1bmN0aW9uIGQzaWQ8R0VsZW1lbnQgZXh0ZW5kcyBCYXNlVHlwZT4oXG4gIHNlbGVjdG9yOiBzdHJpbmdcbik6IFNlbGVjdGlvbjxHRWxlbWVudCwgYW55LCBIVE1MRWxlbWVudCwgYW55PiB7XG4gIHJldHVybiBzZWxlY3Q8R0VsZW1lbnQsIGFueT4oYCMke3NlbGVjdG9yfWApO1xufVxuXG4vKipcbiAqXG4gKiBBbGxvdyBzZXF1ZW5jaW5nIG9mIGQzIGFuaW1hdGlvbnMgYnkgd2FpdGluZyBmb3IgYWxsIHRyYW5zaXRpb25zIHRvIGVuZCBiZWZvcmUgbW92aW5nIHRvIHRoZSBuZXh0IFwic3RlcFwiXG4gKlxuICovXG5cbmZ1bmN0aW9uIG9uRW5kQWxsICh0cmFuc2l0aW9uOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcbiAgaWYgKHRyYW5zaXRpb24uZW1wdHkoKSkge1xuICAgIGNhbGxiYWNrKCk7XG4gIH0gZWxzZSB7XG4gICAgbGV0IG4gPSB0cmFuc2l0aW9uLnNpemUoKTtcbiAgICB0cmFuc2l0aW9uLm9uKFwiZW5kXCIsICAoKSA9PiB7XG4gICAgICBuID0gbi0xO1xuICAgICAgaWYgKG4gPT09IDApIHtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RlcFRocm91Z2goaW50ZXJwRnVuYzogYW55LCBzdGVwczogYW55KSB7XG4gIGlmIChzdGVwcy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3Qgc3RlcCA9IHN0ZXBzWzBdO1xuXG4gICAgaW50ZXJwRnVuYyhzdGVwKVxuICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgLmRlbGF5KDMwMClcbiAgICAgIC5jYWxsKG9uRW5kQWxsLCAoKSA9PiB7XG4gICAgICAgIHN0ZXBUaHJvdWdoKGludGVycEZ1bmMsIHN0ZXBzLnNsaWNlKDEpKTtcbiAgICAgIH0pO1xuICB9XG59XG4iXX0=