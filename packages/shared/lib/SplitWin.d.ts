/**
 *
 * Construct a tree of nested windowed panes, where each intermediate node holds a list of child panes,
 *  and the leaves are user content.
 *
 *
 *
 *   .splitwin-root      : root element in hierarchy
 *   .splitwin-pane      : child panes, immediately nested within a div.split-pane-frame
 *
 *
 */
import Split from "split.js";
export declare const SPLIT_OPTIONS: {
    sizes: never[];
    minSize: never[];
    gutterSize: number;
    snapOffset: number;
    direction: string;
    cursor: string;
    gutter: () => void;
    elementStyle: () => void;
    gutterStyle: () => void;
    onDrag: () => void;
    onDragStart: () => void;
    onDragEnd: () => void;
};
export declare enum FrameFlowDir {
    Row = 0,
    Col = 1
}
declare class Frame {
    elem: JQuery<Element>;
    private frameId;
    private direction;
    private split?;
    private panes;
    constructor($elem: JQuery);
    setDirection(dir: FrameFlowDir): void;
    clientAreaSelector(): string;
    clientArea(): JQuery<HTMLElement>;
    childrenDiv(): JQuery<HTMLElement>;
    getChildren(): Frame[];
    getSplitDir(): "horizontal" | "vertical";
    getParentPane(): string;
    addPanes(n: number): Frame[];
    rebuild(): void;
    updateSplit(split?: Split.Instance): void;
    addPaneControls(): void;
    delete(): void;
    maximize(): void;
    restoreSize(): void;
}
export declare function createRootFrame(containerId: string): Frame;
export {};
