/**
 *
 **/


import * as _ from 'lodash';
import * as d3 from 'd3';
import * as $ from 'jquery';

import * as d3x from '../lib/d3-extras';
import * as util from  '../lib/commons.js';
import * as frame from '../lib/frame.js';
import {shared} from '../lib/shared-state';
import * as global from '../lib/shared-state';
import * as server from '../lib/serverApi.js';
import * as spu  from '../lib/SplitWin.js';
import * as rtrees from  '../lib/rtrees.js';
import { setupPageImages } from '../lib/PageImageListWidget.js';
import * as stepper from  '../lib/d3-stepper.js';
import * as coords from '../lib/coord-sys';

import * as TraceLogs from '../lib/TraceLogs';

import { t } from '../lib/jstags.js';

import {addViewLinkOptions} from './shared-main';

// TODO reinstate tooltips

function setupFrameLayout() {

    let rootFrame = spu.createRootFrame("#main-content");
    rootFrame.setDirection(spu.row);

    let [paneLeft, paneRight] = rootFrame.addPanes(2);

    $(paneLeft.clientAreaSelector()).attr('id', 'page-image-list');
    $(paneLeft.clientAreaSelector()).addClass('client-content');

    paneRight.clientArea().append(
        t.div('.scrollable-pane', [
            t.div('#tracelog-menu')
        ])
    );

    addViewLinkOptions();
}
/**
 *
 * @param {any} r
 */
function addTooltip(r) {
    return r.on("mouseover", function() {
        r .call(d3x.initStroke, 'yellow', 1, 2.0)
            .transition().duration(200)
            .call(d3x.initStroke, 'red', 1.0)
            .call(d3x.initFill, 'red', 0.2)
        ;

    }) .on("mouseout", function() {
        r .transition().duration(300)
            .call(d3x.initStroke, 'black', 1, 0.3)
            .call(d3x.initFill, 'blue', 0.2)
        ;
    });

}

/**
 *
 * @param {any} data
 */
function getId(data) {
    let shape = data.type;

    if (data.id != undefined) {
        return data.id;
    } else {
        switch (shape) {
        case "rect":
            return "r_" + data.x + "_" + data.y + "_" + data.width + "_" + data.height;
        case "circle":
            return "c_" + data.cx + "_" + data.cy + "_" + data.r ;
        case "line":
            return "l_" + data.x1 + "_" + data.y1 + "_" + data.x2 + "_" + data.y2 ;
        case "path":
            return "p_" + data.d;
        }
    }
    return "";
}


function getCls(data) {
    let cls = "shape";
    if (data.class != undefined) {
        cls = cls + " " + data.class;
    }
    if (data.hover) {
        cls = cls + " hover";
    }

    return cls;

}

function dataToColor(d) {
    let color = 'black';
    // if (d.stroke !== undefined) {
    //     color = d.stroke;
    // }
    // else {
    //     color = colorMap[d.class];
    // }
    return color;
}

function setDefaultStrokeColor(d) {
    return dataToColor(d);
}

function setDefaultFillColor(d) {
    return dataToColor(d);
}

function initShapeAttrs(r) {
    let shape = r.node().nodeName.toLowerCase();

    switch (shape) {
    case "rect":
        return r.attr("x", function(d){ return d.x; })
            .attr("y", function(d){ return d.y; })
            .attr("width", function(d){ return d.width; })
            .attr("height", function(d){ return d.height; })
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
        return r.attr("cx", function(d){ return d.cx; })
            .attr("cy", function(d){ return d.cy; })
            .attr("r", function(d){ return d.r; })
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
        return r.attr("x1", function(d){ return d.x1; })
            .attr("y1", function(d){ return d.y1; })
            .attr("x2", function(d){ return d.x2; })
            .attr("y2", function(d){ return d.y2; })
            .attr("id", getId)
            .attr("class", getCls)
            .attr("label", getCls)
            .attr("stroke-width", 2)
            .attr("fill",  setDefaultFillColor)
            .attr("stroke", setDefaultStrokeColor)
            .call(addTooltip)
        ;
    case "path":
        return r.attr("d", function(d){ return d.d; })
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

let pageImageListWidget;
let pageImageWidget;

function selectShapes(dataBlock) {
    let pageId = pageImageWidget.svgId;
    let d3Page = d3.select(`#${pageId}`);
    d3Page.select('image')
        .attr('opacity', 0.7)
    ;
    let shapes = dataBlock;

    return d3Page.selectAll(".shape")
        .data(shapes, getId) ;
}


function runAllTraces(tracelogs) {
    _.each(tracelogs, t => {
        runTrace(t);
    });
}

function runTrace(tracelog) {
    let pageNum =  tracelog.page;

    pageImageWidget = pageImageListWidget.pageImageWidgets[pageNum];
    let body = tracelog.body;
    let decodedShapes = _.map(body, s => coords.fromFigure(s).svgShape());

    stepper.stepThrough(DrawShapes, [decodedShapes]);
}

function DrawShapes(dataBlock) {

    let shapes = selectShapes(dataBlock);

    return shapes.enter()
        .each(function (shape){
            let self = d3.select(this);
            shape.id = getId(shape);
            return self.append(shape.type)
                .call(initShapeAttrs) ;
        })
    ;
}

export function runMain() {

    frame.setupFrameLayout();

    let entry = util.corpusEntry();

    shared.currentDocument = entry;

    Promise.all([
        server.getTracelog(entry),
        server.getCorpusArtifactTextgrid(entry)
    ]) .then(([tracelogJson, textGridJson]) => {

        let pages = textGridJson.pages;
        let textgrids = _.map(pages, p => p.textgrid);

        let gridData = rtrees.initGridData(textgrids);

        global.initGlobalMouseTracking();

        setupFrameLayout();

        pageImageListWidget = setupPageImages('page-image-list', textGridJson, gridData);

        const traceLogFilter = new TraceLogs.SelectionFilter(tracelogJson);

        const n = traceLogFilter.getNode();
        $("#tracelog-menu").append(n);

        traceLogFilter.clearLogs.subscribe((i) => {
            d3.selectAll('image')
                .attr('opacity', 1.0);

            d3.selectAll(".shape")
                .remove();
        });

        traceLogFilter.selectedTraceLogs.subscribe((selectedLogs) => {
            runAllTraces(selectedLogs);
        });

    }) .catch(error => {
        $('.content-pane').append(`<div><p>ERROR: ${error}: ${error}</p></div>`);
    }) ;


}
