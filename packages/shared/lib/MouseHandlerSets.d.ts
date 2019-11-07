/**
 * Helper functions to install/update mouse handlers
 */
export interface MouseHandlers {
    mouseover?(event: JQueryMouseEventObject): void;
    mouseout?(event: JQueryMouseEventObject): void;
    mousemove?(event: JQueryMouseEventObject): void;
    mouseup?(event: JQueryMouseEventObject): void;
    mousedown?(event: JQueryMouseEventObject): void;
    click?(event: JQueryMouseEventObject): void;
}
export declare type MouseHandlerInit = (t: any) => MouseHandlers;
export declare function setMouseHandlers<T>(bindThis: T, targetDivId: string, handlers: MouseHandlerInit[]): void;
