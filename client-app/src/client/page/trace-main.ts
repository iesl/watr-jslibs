/**
 *
 **/


import * as _ from 'lodash';
import * as d3 from 'd3';
import $ from 'jquery';

import * as d3x from '../lib/d3-extras';
import * as util from  '../lib/commons.js';
import * as frame from '../lib/frame.js';
import { shared } from '../lib/shared-state';
import * as global from '../lib/shared-state';
import * as server from '../lib/serverApi.js';
import * as spu  from '../lib/SplitWin.js';
import * as rtrees from  '../lib/rtrees.js';
import { setupPageImages } from '../lib/PageImageListWidget.js';
import * as stepper from  '../lib/d3-stepper.js';
import * as coords from '../lib/coord-sys';


import { t } from '../lib/tstags';

import {addViewLinkOptions} from './shared-main';

// TODO reinstate tooltips

function setupFrameLayout() {

  const rootFrame = spu.createRootFrame("#main-content");
  rootFrame.setDirection(spu.row);

  const [paneLeft, paneRight] = rootFrame.addPanes(2);

  $(paneLeft.clientAreaSelector()).attr('id', 'page-image-list');
  $(paneLeft.clientAreaSelector()).addClass('client-content');

  paneRight.clientArea().append(
    t.div('.scrollable-pane', [
      t.div('#vue-root')
    ])
  );

  addViewLinkOptions();
}
/**
 *
 */
function addTooltip(r: any) {
  return r.on("mouseover", () => {
    r .call(d3x.initStroke, 'yellow', 1, 2.0)
      .transition().duration(200)
      .call(d3x.initStroke, 'red', 1.0)
      .call(d3x.initFill, 'red', 0.2)
    ;

  }) .on("mouseout", () => {
    r .transition().duration(300)
      .call(d3x.initStroke, 'black', 1, 0.3)
      .call(d3x.initFill, 'blue', 0.2)
    ;
  });

}

/**
 *
 */
function getId(data: any): string {
  const shape = data.type;

  let id = "";

  if (data.id !== undefined) {
    id = data.id;
  } else {

    switch (shape) {
      case "rect":
        id =  `r_${data.x}_${data.y}_${data.width}_${data.height}`;
        break;
      case "circle":
        id =  `c_${data.cx}_${data.cy}_${data.r}`;
        break;
      case "line":
        id =  `l_${data.x1}_${data.y1}_${data.x2}_${data.y2}`;
        break;
      case "path":
        id =  `p_${data.d}`;
        break;
      default:
        throw new Error(`getId(shape=${data}) could not construct id`);
    }
  }

  return id;
}


function getCls(data: any) {
  let cls = "shape";
  if (data.class !== undefined) {
    cls = `${cls} ${data.class}`;
  }
  if (data.hover) {
    cls = `${cls} hover`;
  }

  return cls;
}

function dataToColor() {
  const color = 'black';
  return color;
}

function setDefaultStrokeColor() {
  return dataToColor();
}

function setDefaultFillColor() {
  return dataToColor();
}

function initShapeAttrs(r: any) {
  const shape = r.node().nodeName.toLowerCase();
  console.log('initShapeAttrs');

  switch (shape) {
    case "rect":
      return r.attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y)
        .attr("width", (d: any) => d.width)
        .attr("height", (d: any) => d.height)
        .attr("id", getId)
        .attr("class", getCls)
        .attr("label", getCls)
        .attr("opacity", 0.3)
        .attr("fill-opacity", 0.4)
        .attr("stroke-opacity", 0.9)
        .attr("stroke-width", 2)
        .attr("fill",  setDefaultFillColor)
        .attr("stroke", "green")
        .call(addTooltip)
      ;

    case "circle":
      return r.attr("cx", (d: any) => d.cx)
        .attr("cy", (d: any) => d.cy)
        .attr("r", (d: any) => d.r)
        .attr("id", getId)
        .attr("class", getCls)
        .attr("label", getCls)
        .attr("fill-opacity", 0.2)
        .attr("stroke-width", 1)
        .attr("fill",  setDefaultFillColor)
        .attr("stroke", setDefaultStrokeColor)
        .call(addTooltip)
      ;

    case "line":
      return r.attr("x1", (d: any) => d.x1)
        .attr("y1", (d: any) => d.y1)
        .attr("x2", (d: any) => d.x2)
        .attr("y2", (d: any) => d.y2)
        .attr("id", getId)
        .attr("class", getCls)
        .attr("label", getCls)
        .attr("stroke-width", 2)
        .attr("fill",  setDefaultFillColor)
        .attr("stroke", setDefaultStrokeColor)
        .call(addTooltip)
      ;
    case "path":
      return r.attr("d", (d: any) => d.d)
        .attr("class", getCls)
        .attr("label", getCls)
        .attr("stroke-width", 1)
        .attr("fill",  "blue")
        .attr("stroke", "black")
        .attr("fill-opacity", 0.2)
        .attr("stroke-opacity", 0.3)
        .call(addTooltip)
      ;
  }

  return r;
}

let pageImageListWidget: any;
let pageImageWidget: any;

function selectShapes(dataBlock: any) {
  const pageId = pageImageWidget.svgId;
  const d3Page = d3.select(`#${pageId}`);
  d3Page.select('image')
    .attr('opacity', 0.7)
  ;
  const shapes = dataBlock;

  return d3Page.selectAll(".shape")
    .data(shapes, getId) ;
}


function runAllTraces(tracelogs: any): void {
  _.each(tracelogs, t => {
    runTrace(t);
  });
}


function runTrace(tracelog: any): void {

  const pageNum =  tracelog.page;
  // console.log('runTrace', tracelog);

  pageImageWidget = pageImageListWidget.pageImageWidgets[pageNum];
  const body: any[] = tracelog.body;
  const mapf = (s: any) => coords.fromFigure(s).svgShape();

  const decodedShapes = _.map(body, mapf);
  // console.log('runTrace: decodedShapes', decodedShapes);

  stepper.stepThrough(doDrawShapes, [decodedShapes]);
}

function doDrawShapes(dataBlock: any) {

  // console.log('doDrawShapes: dataBlock', dataBlock);
  const shapes = selectShapes(dataBlock);
  // console.log('doDrawShapes: shapes', shapes);

  return shapes.enter()
    .each(function (shape) {
      const self = d3.select(this);
      shape.id = getId(shape);
      return self.append(shape.type)
        .call(initShapeAttrs) ;
    })
  ;
}

import Vue from 'vue';
import Vuex, {} from "vuex";
Vue.use(Vuex);

import {
  FilterWidget,
  FilteringStateModule,
  // FilteringState,
  CandidateGroup
} from 'vueComponentLib';

interface Headers {
  tags: string;
  name: string;
  callSite: string;
}
interface LogEntry {
  logType: string;
  page: number;
  headers: Headers;
}

export function runMain() {

  frame.setupFrameLayout();

  ///////////////////
  ///////////////////
  const store = new Vuex.Store({
    modules: {
      filteringState: new FilteringStateModule()
    }
  });

  const rootVue = new Vue({
    store,
    components: {
      'filter-widget': FilterWidget,
    },

    render(h) {
      return h('filter-widget');
    }
  });


  ///////////////////
  ///////////////////

  const entry = util.corpusEntry();

  shared.currentDocument = entry;

  Promise.all([
    server.getTracelog(entry),
    server.getCorpusArtifactTextgrid(entry)
  ]) .then(([tracelogJson, textGridJson]) => {

    const pages = textGridJson.pages;
    const textgrids = _.map(pages, p => p.textgrid);

    const gridData = rtrees.initGridData(textgrids);

    global.initGlobalMouseTracking();

    setupFrameLayout();

    pageImageListWidget = setupPageImages('page-image-list', textGridJson, gridData);


    rootVue.$mount('#vue-root');

    const g: CandidateGroup = {
      candidates: tracelogJson,
      groupKeyFunc: (l: LogEntry) => ({ multikey: ["trace", `p${l.page+1}. ${l.headers.callSite} ${l.headers.tags}`], displayTitle: "todo" })
    };



    rootVue.$nextTick((vm) => {
      rootVue.$store.dispatch('filteringState/addCandidates', g);
    });


    store.subscribe((mutation, state) => {
      console.log("subscribe: mutation ", mutation, state);

      switch (mutation.type) {
        case "filteringState/setFilteredRecords":
          const recs1 = _.map(mutation.payload, r => r.records);
          const hitLogs = _.flatMap(recs1, r => _.map(r, r0 => r0.candidate));
          if (hitLogs.length > 0) {
            runAllTraces(hitLogs);
          } else {
            d3.selectAll('image')
              .attr('opacity', 1.0);

            d3.selectAll(".shape")
              .remove();

          }
          break;
      }
    });

  }) .catch(error => {
    $('.content-pane').append(`<div><p>ERROR: ${error}: ${error}</p></div>`);
  }) ;


}
