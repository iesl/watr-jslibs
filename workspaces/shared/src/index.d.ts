
/**

Split(['#a', '#b'], {
    gutterSize: 8,
    cursor: 'col-resize'
});

*/

// declare namespace Split {}
declare module 'split.js' {

interface SplitOptions {
  sizes?: number[];
  minSize?: number[] | number;
  gutterSize?: number;
  snapOffset?: number;
  direction?: "horizontal" | "vertical";
  cursor?: "col-resize" | "row-resize";
  gutter?: (index: number, direction: string) => HTMLElement;
  elementStyle?: (dimension: string, elementSize: number, gutterSize: number) => any;
  gutterStyle?: (dimension: string, gutterSize: number) => any;
  onDrag?: ()  => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export class SplitObject {
  setSizes: (sizes: number[]) => void;
  getSizes: () => number[];
  collapse: (index: number) => void;
  destroy: () => void;
}

  function Split(elements: HTMLElement | string[], options?: SplitOptions): SplitObject;

  export default Split;
}


// declare module 'split.js' {

//     interface SplitOptions {
//       sizes?: number[];
//       minSize?: number[] | number;
//       gutterSize?: number;
//       snapOffset?: number;
//       direction?: "horizontal" | "vertical";
//       cursor?: "col-resize" | "row-resize";
//       gutter?: (index: number, direction: string) => HTMLElement;
//       elementStyle?: (dimension: string, elementSize: number, gutterSize: number) => any;
//       gutterStyle?: (dimension: string, gutterSize: number) => any;
//       onDrag?: ()  => void;
//       onDragStart?: () => void;
//       onDragEnd?: () => void;
//     }

//     class SplitObject {
//       setSizes: (sizes: number[]) => void;
//       getSizes: () => number[];
//       collapse: (index: number) => void;
//       destroy: () => void;
//     }

//   function Split(elements: HTMLElement | string[], options?: SplitOptions): Split.SplitObject;

//   export default Split;
// }
