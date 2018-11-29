//
import {Vue, Component, Prop, Watch} from "vue-property-decorator";

import {namespace} from "vuex-class";

// const filterState = namespace("filteringState");

const fixedTextgridWidth = 900;

@Component
export default class TextGraph extends Vue {
  @Prop(Number) gridNum: number = 0;


  get frameId(): string { return `textgrid-frame-${this.gridNum}`; }
  get canvasId(): string { return `textgrid-canvas-${this.gridNum}`; }
  get svgId(): string { return `textgrid-svg-${this.gridNum}`; }

  get gridWidth(): number {
    return fixedTextgridWidth;
  }

  get gridHeight(): number {
    return 200;
  }

  get frameStyle(): string {
    return `width: ${fixedTextgridWidth}px; height: ${this.gridHeight}px; background: red;`;
  }
}
