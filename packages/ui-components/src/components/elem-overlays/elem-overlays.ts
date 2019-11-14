
import _ from 'lodash';

import {
  createComponent,
  ref,
} from '@vue/composition-api';



// get frameId(): string { return `page-image-frame-${this.pageNum}`; }
// get imageContentId(): string { return `page-image-content-${this.pageNum}`; }
// get svgId(): string { return `page-image-svg-${this.pageNum}`; }
// get imageHref(): string { return `http://localhost:3100/corpus-entry-0/page-images/page-1.opt.png`; }

// selectSvg() {
//   return d3x.d3id(this.svgId);
// }

// get pageWidth(): number {
//   return 600;
// }

// get pageHeight(): number {
//   return 800;
// }

// get dimensionStyle(): string {
//   return `width: ${this.pageWidth}px; height: ${this.pageHeight}px;`;
// }


// <svg :id="svgId" :style="dimensionStyle" :width="pageWidth" :height="pageHeight" class="page-image">
// <image :width="pageWidth" :height="pageHeight" :style="dimensionStyle" :href="imageHref"></image>
// </svg>

// mounted() {

//   this.$nextTick(() => {
//     console.log('mounted');

//     d3x.d3id(this.imageContentId)
//       .append("svg").classed("page-image", true)
//       .attr("id", this.svgId)
//       .attr("page", this.pageNum)
//       .attr("width", this.pageWidth)
//       .attr("height", this.pageHeight)
//       .attr("style", this.dimensionStyle)
//     ;

//     this.initHoverReticles();

//     this.initialCandidates();
//     this.setMouseHandlers([
//       defaultMouseHandlers,
//     ]);

//   })
// }

// initHoverReticles() {
//   const reticleGroup = this.selectSvg()
//     .append("g")
//     .classed("reticles", true);

//   reticleGroup
//     .append("rect")
//     .classed("query-reticle", true)
//     .call(d3x.initStroke, "blue", 1, 0.6)
//     .call(d3x.initFill, "blue", 0.3)
//   ;

//   return reticleGroup;
// }


export function useElemOverlays(divId: string) {
  const frameRef = ref(null);
  const layersRef = ref(null);

  return {
    frameRef,
    layersRef

  };
}
