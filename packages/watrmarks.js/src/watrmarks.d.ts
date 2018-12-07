
export interface JsArray {
}

// TextGridInterop
// TextGridInterop_gridRegions
// TextGridInterop_labelSchemas
// TextGridInterop_textGrids
// TextGridInterop_widgetDisplayGridProps
declare namespace widgetDisplayGridProps {
  export function gridRegions(gridProps: any): any;
}

declare namespace labelSchemas {
  export function allLabels(labelSchema: any): any;
}


declare class Node {}
declare class Leaf {}
declare type Tree = Node | Leaf;

export namespace Tree {
    export function Node(label: any, ch: Tree[]): Tree;
    export function Leaf(label: any): Tree;
    export function drawTree(desc: Tree): string;
}
