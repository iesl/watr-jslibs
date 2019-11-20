
import _ from 'lodash';


import {
  Ref,
  watch,
  ref,
} from '@vue/composition-api';


export enum OverlayType {
  Img,
  Svg,
  Canvas,
}
export interface OverlayElement {
  canvasElem?: HTMLCanvasElement;
  svgElem?: SVGElement;
  imgElem?: HTMLImageElement;
}


export function useElemOverlays(overlayContainerRef: Ref<HTMLDivElement>, ...overlays: OverlayType[]) {
  const hasImg = overlays.includes(OverlayType.Img)
  const hasSvg = overlays.includes(OverlayType.Svg)
  const hasCanvas = overlays.includes(OverlayType.Canvas)

  const dimensions: Ref<[number, number]> = ref([10, 10]);
  const isInitialized = ref(false);

  const width = () => dimensions.value[0];
  const height = () => dimensions.value[1];
  const placeholderImage = () => `http://via.placeholder.com/${width()}x${height()}`;


  const imgElem: Ref<HTMLImageElement> = ref(null);
  const svgElem: Ref<SVGElement> = ref(null);
  const canvasElem: Ref<HTMLCanvasElement> = ref(null);
  const imgElemSource: Ref<string> = ref(null);

  watch(overlayContainerRef, () => {
    const overlayContainer = overlayContainerRef.value;
    if (overlayContainer === null) return;

    overlayContainer.classList.add('layers');

    if (hasImg) {
      const el = imgElem.value = document.createElement('img');
      el.classList.add('layer');
      overlayContainer.append(el);
    }

    if (hasCanvas) {
      const el = canvasElem.value = document.createElement('canvas');
      el.classList.add('layer');
      overlayContainer.append(el);
    }

    if (hasSvg) {
      const el = svgElem.value = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      el.classList.add('layer');
      el.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
      overlayContainer.append(el);
    }

    watch([imgElem, imgElemSource], () => {
      const img = imgElem.value
      const src = imgElemSource.value
      if (img && src) {
        img.src = src;
      }
    });

    watch(dimensions, ([width, height]) => {

      const w = `${width}px`;
      const h = `${height}px`;

      overlayContainer.style.width = w;
      overlayContainer.style.height = h;

      if (canvasElem) {
        canvasElem.value.setAttribute('width', w);
        canvasElem.value.setAttribute('height', h);
      }
      if (svgElem) {
        svgElem.value.setAttribute('width', w);
        svgElem.value.setAttribute('height', h);
      }
      if (imgElem) {
        if (imgElemSource.value) {
          imgElem.value.width = width;
          imgElem.value.height = height;
        } else {
          imgElem.value.src = placeholderImage();
        }
      }
    });

    isInitialized.value = true

  });





  function setImageSource(src: string) {
    imgElemSource.value = src;
  }

  function setDimensions(width: number, height: number) {
    dimensions.value = [width, height];
  }

  return {
    elems: { imgElem, svgElem, canvasElem },
    setDimensions,
    setImageSource,
    isInitialized
  };
}
