/**
 * Various Utility functions
 */
export declare function pp(a: any): string;
export declare function getOrDie<T>(v: T | null | undefined, msg?: string): T;
/**
 */
export declare function corpusEntry(): string;
export declare function getParameterByName(name: string, urlstr?: string): string | null;
export declare function newIdGenerator(): () => number;
export declare function eventHasLeftClick(event: JQuery.Event): boolean;
export declare function getDescendantTree(rootSelector: string): any;
export declare function getDescendantTreeString(rootSelector: string): string;
