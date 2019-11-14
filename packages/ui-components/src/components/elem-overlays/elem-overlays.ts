
import _ from 'lodash';

// import {
//   ref,
// } from '@vue/composition-api';


export enum OverlayType {
  Img,
  Svg,
  Canvas,
}

export function useElemOverlays(overlayContainer: HTMLDivElement, ...overlays: OverlayType[]) {
  overlayContainer.classList.add('layers')

  const hasImg = overlays.includes(OverlayType.Img)
  const hasSvg = overlays.includes(OverlayType.Svg)
  const hasCanvas = overlays.includes(OverlayType.Canvas)

  let elems = {
    canvasElem: undefined,
    svgElem: undefined,
    imgElem: undefined
  }

  if (hasImg) {
    const el = document.createElement('img');
    elems.imgElem = el;
    overlayContainer.append(el)
  }

  if (hasCanvas) {
    const el = document.createElement('canvas');
    overlayContainer.appendChild(el)
    elems.canvasElem = el;
  }

  if (hasSvg) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    overlayContainer.append(svg)
    elems.svgElem = svg;
  }


  const children = overlayContainer.children;
  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    child.classList.add('layer');
  }


  function setDimensions(width: number, height: number) {

    overlayContainer.style.width = `${width}px`;
    overlayContainer.style.height = `${height}px`;

    if (elems.canvasElem) {
      elems.canvasElem.setAttribute('width', width);
      elems.canvasElem.setAttribute('height', height);
    }
    if (elems.svgElem) {
      elems.svgElem.setAttribute('width', width);
      elems.svgElem.setAttribute('height', height);
    }
    if (elems.imgElem) {
      const href = `http://via.placeholder.com/${width}x${height}`;
      elems.imgElem.setAttribute('src', href);
    }
  }

  setDimensions(250, 300);

  return {
    elems,
    setDimensions
  };
}
  // <div ref="frameRef" class="frame">

  // <div class="frame-content">
  // <div ref="layersRef" class="layers"> </div>
  // </div>

  // </div>




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
