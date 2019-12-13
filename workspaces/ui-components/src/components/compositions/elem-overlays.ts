
import _ from 'lodash';

import {
  Ref,
  watch,
  ref,
} from '@vue/composition-api';

import { StateArgs, waitFor } from '~/components/compositions/component-basics'

export interface OverlayElements {
  canvasElem: Ref<HTMLCanvasElement|null>;
  imgElem: Ref<HTMLImageElement|null>;
}

export interface ImgCanvasOverlay {
  elems: OverlayElements
  setDimensions: (width: number, height: number) => void;
  dimensions: Readonly<Ref<[number, number]>>;
  setImageSource: (src: string) => void;
}

type Args = StateArgs & {
  mountPoint: Ref<HTMLDivElement|null>
};

export function useImgCanvasOverlays({
  mountPoint, state
}: Args): ImgCanvasOverlay {

  const dimensions: Ref<[number, number]> = ref([10, 10]);

  const width = () => dimensions.value[0];
  const height = () => dimensions.value[1];
  const placeholderImage = () => `http://via.placeholder.com/${width()}x${height()}`;

  const imgElem: Ref<HTMLImageElement|null> = ref(null);
  const canvasElem: Ref<HTMLCanvasElement|null> = ref(null);
  const imgElemSource: Ref<string|null> = ref(null);

  waitFor('ImgCanvasOverlays', {
    state,
    dependsOn: [mountPoint],
    ensureTruthy: [imgElem, canvasElem]
  }, () => {

    const overlayContainer = mountPoint.value!;

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

      canvasEl.setAttribute('width', w);
      canvasEl.setAttribute('height', h);

      if (imgElemSource.value) {
        imgEl.width = width;
        imgEl.height = height;
      } else {
        imgEl.src = placeholderImage();
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

export function useImgCanvasSvgOverlays({
  mountPoint, state
}: Args) {
  const imgCanvasOverlays = useImgCanvasOverlays({ mountPoint, state });
  const { setImageSource, elems, setDimensions, dimensions } = imgCanvasOverlays;
  const { imgElem, canvasElem } = elems;

  const svgElem: Ref<SVGElement|null> = ref(null);

  waitFor('ImgCanvasSvgOverlays', {
    state,
    dependsOn: [mountPoint]
  }, () => {
    watch(mountPoint, (overlayContainer) => {
      if (overlayContainer === null) return;

      // const overlayContainer = mountPoint.value;

      const el = svgElem.value = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      el.classList.add('layer');
      el.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
      overlayContainer.append(el);

      watch(dimensions, ([width, height]) => {
        const w = `${width}px`;
        const h = `${height}px`;

        el.setAttribute('width', w);
        el.setAttribute('height', h);
      });

    });

  });

  return {
    elems: { imgElem, canvasElem, svgElem },
    setDimensions,
    setImageSource,
  };
}
