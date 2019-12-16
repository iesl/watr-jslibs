/**
 *
 */
import $ from 'jquery';
import _ from 'lodash';
import { select } from "d3-selection";
import 'd3-transition';

import {
  GridData,
  initGridData,
  gridDataToGlyphData,
  TextDataPoint
} from '~/lib/TextGlyphDataTypes'

import { onMounted, watch } from '@vue/composition-api';
import { useEventlibHover } from '~/components/compositions/eventlib-hover'
import { coords, d3x, GridTypes, Point, toBox } from "sharedLib";

import { useImgCanvasSvgOverlays  } from '~/components/compositions/elem-overlays'
import { initState, waitFor } from '~/components/compositions/component-basics';
import { divRef } from '~/lib/vue-composition-lib';

function setup() {
  const state = initState();

  const mountPoint = divRef();

  const eventlibHover = useEventlibHover({ targetDivRef: mountPoint, state });
  const { hoveringRef, eventlibCore } = eventlibHover;
  const { loadShapes, mousePosRef } = eventlibCore;

  const elemOverlay = useImgCanvasSvgOverlays({ mountPoint, state });

  waitFor('HoverStory', {
    state
  }, () => {

    const svgElem = elemOverlay.elems.svgElem.value;
    const svgSelection = select(svgElem);

    function initHoverReticles() {
      const reticleGroup = svgSelection
        .append("g")
        .classed("reticles", true);

      reticleGroup
        .append("rect")
        .classed("query-reticle", true)
        .call(d3x.initStroke, "blue", 1, 0.6)
        .call(d3x.initFill, "blue", 0.3)
      ;

      return reticleGroup;
    }

    const reticleGroup = initHoverReticles();


    watch(hoveringRef, (hovering) => {

      const mousePt = coords.mkPoint.fromXy(mousePosRef.x, mousePosRef.y);
      const queryBox = coords.boxCenteredAt(mousePt, 8, 8);

      reticleGroup
        .select("rect.query-reticle")
        .call(d3x.initRect, () => queryBox) ;


      const hits = _.map(hovering, (hit) => {
        const hitBox = toBox(hit);
        const v: any = hitBox;
        const w: any = hit;
        v.id = w.id;
        v.bbox = hitBox;
        return hit;
      });

      const d3$hitReticles = reticleGroup
        .selectAll("rect.hit-reticle")
        .data(hits, (d: any) => d)
      ;


      d3$hitReticles .enter()
        .append("rect")
        .classed("hit-reticle", true)
        .attr("id", (d: any) => d.id)
        .attr("pointer-events", "none")
        // .call(d3x.initRect, (d: any) => d.bbox)
        .call(d3x.initStroke, "green", 1, 0.5)
        .call(d3x.initFill, "yellow", 0.5)
      ;

      d3$hitReticles.exit()
        .remove();

    });

  });

  onMounted(() => {

    elemOverlay.setDimensions(800, 800);

    $.getJSON('http://localhost:3100/textgrids/textgrid-00.json', (textgrid: GridTypes.Grid) => {
      const pageNum = 0;
      const page0 = textgrid.pages[0];
      const textgridPage0 = page0.textgrid;
      const tmpPageMargin = 10;
      const origin = new Point(tmpPageMargin, tmpPageMargin, coords.CoordSys.GraphUnits);
      const gridData: GridData = initGridData(textgridPage0, pageNum, () => 10, origin, 10);
      const glyphData: TextDataPoint[] = gridDataToGlyphData(gridData.textDataPoints);

      console.log('loading glyphData, len=', glyphData.length)
      loadShapes(glyphData);
      console.log('loaded glyphData')

    }, (err) => {
      console.log('err', err);
    });

  });

  return {
    hoveringRef, mousePosRef, loadShapes, mountPoint
  }
}


export default {
  setup
}
