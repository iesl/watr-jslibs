/**
 * Put any type definitions for external javascript libraries here
 */

import Vue, { VNode } from "vue";

declare global {
  namespace JSX {
    interface Element extends VNode {}
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}
