
import _ from 'lodash';

import {
  Ref,
  watch,
  ref,
} from '@vue/composition-api';

import { StateArgs, waitFor } from '~/components/component-basics'

export enum OverlayType {
  Img,
  Svg,
  Canvas,
}
export interface OverlayElement {
  canvasElem?: Ref<HTMLCanvasElement>;
  svgElem?: Ref<SVGElement>;
  imgElem?: Ref<HTMLImageElement>;
}

type Args = StateArgs & {
  containerRef: Ref<HTMLDivElement>
};

export function useImgCanvasOverlays({
  containerRef, state
}: Args) {

  const dimensions: Ref<[number, number]> = ref([10, 10]);

  const width = () => dimensions.value[0];
  const height = () => dimensions.value[1];
  const placeholderImage = () => `http://via.placeholder.com/${width()}x${height()}`;

  const imgElem: Ref<HTMLImageElement> = ref(null);
  const canvasElem: Ref<HTMLCanvasElement> = ref(null);
  const imgElemSource: Ref<string> = ref(null);

  waitFor('ImgCanvasOverlays', {
    state,
    dependsOn: [containerRef]
  }, () => {

    const overlayContainer = containerRef.value;
    // watch(containerRef, (overlayContainer) => {
    // });
    // if (overlayContainer === null) return;

    overlayContainer.classList.add('layers');

    const imgEl = imgElem.value = document.createElement('img');
    imgEl.classList.add('layer');
    overlayContainer.append(imgEl);

    const canvasEl = canvasElem.value = document.createElement('canvas');
    canvasEl.classList.add('layer');
    overlayContainer.append(canvasEl);


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

      canvasElem.value.setAttribute('width', w);
      canvasElem.value.setAttribute('height', h);

      if (imgElemSource.value) {
        imgElem.value.width = width;
        imgElem.value.height = height;
      } else {
        imgElem.value.src = placeholderImage();
      }
    });


  });

  function setImageSource(src: string) {
    imgElemSource.value = src;
  }

  function setDimensions(width: number, height: number) {
    dimensions.value = [width, height];
  }

  return {
    elems: { imgElem, canvasElem },
    setDimensions,
    dimensions,
    setImageSource,
  };
}

// export function useImgCanvasSvgOverlays(containerRef: Ref<HTMLDivElement>) {
export function useImgCanvasSvgOverlays({
  containerRef, state
}: Args) {
  const imgCanvasOverlays = useImgCanvasOverlays({ containerRef, state });
  const { setImageSource, elems, setDimensions, dimensions } = imgCanvasOverlays;
  const { imgElem, canvasElem } = elems;

  // const isInitialized = ref(false);

  const svgElem: Ref<SVGElement> = ref(null);

  waitFor('ImgCanvasSvgOverlays', {
    state,
    dependsOn: [containerRef]
  }, () => {
    watch(containerRef, (overlayContainer) => {
      if (overlayContainer === null) return;

      // const overlayContainer = containerRef.value;

      const el = svgElem.value = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      el.classList.add('layer');
      el.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
      overlayContainer.append(el);

      watch(dimensions, ([width, height]) => {
        const w = `${width}px`;
        const h = `${height}px`;

        svgElem.value.setAttribute('width', w);
        svgElem.value.setAttribute('height', h);
      });

    });

  });

  return {
    elems: { imgElem, canvasElem, svgElem },
    setDimensions,
    setImageSource,
  };
}
