/**
 *
 **/

/* global */

import * as _ from 'lodash';
import * as d3 from 'd3';
import * as $ from 'jquery';

import * as util from  '../lib/commons.js';
import * as frame from '../lib/frame.js';
import {shared} from '../lib/shared-state';
import * as global from '../lib/shared-state';
import * as server from '../lib/serverApi.js';
import * as spu  from '../lib/SplitWin.js';
import * as rtrees from  '../lib/rtrees.js';
import { setupPageImages } from '../lib/PageImageListWidget.js';
import * as stepper from  '../lib/d3-stepper.js';
// import * as d3x from '../lib/d3-extras';

import {t} from '../lib/jstags.js';


function setupFrameLayout() {

    let rootFrame = spu.createRootFrame("#main-content");
    rootFrame.setDirection(spu.row);

    let [paneLeft, paneRight] = rootFrame.addPanes(2);

    $(paneLeft.clientAreaSelector()).attr('id', 'page-image-list');
    $(paneLeft.clientAreaSelector()).addClass('client-content');

    paneRight.clientArea().append(
        t.div('#tracelog-menu')
    );
}

let colorMap = {
    "Caption"                : "blue",
    "Image"                  : "brown",
    "CharRun"                : "chocolate",
    "CharRunBegin"           : "purple",
    "CharRunBaseline"        : "purple",
    "FontBaseline"           : "blue",
    "LeftAlignedCharCol"     : "crimson",
    "RightAlignedCharCol"    : "darkorchid",
    "LeftAlignedColEnd"      : "darkred",
    "HPageDivider"           : "darksalmon",
    "ColLeftEvidence"        : "darkturquoise",
    "ColRightEvidence"       : "firebrick",
    "PageLines"              : "green",
    "HLinePath"              : "indianred",
    "VLinePath"              : "khaki",
    "LinePath"               : "lavender",
    "OutlineBox"             : "magenta"
} ;

// Define the div for the tooltip
let tooltipDiv = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function addTooltip(r) {
    return r.on("mouseover", function(d) {
        if (d.class != undefined) {
            tooltipDiv.transition()
                .duration(100)
                .style("opacity", .9);
            tooltipDiv.html( d.class + "::" + getId(d) )
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        }
    })
        .on("mouseout", function(d) {
            if (d.class != undefined) {
                tooltipDiv.transition()
                    .transition()
                    .delay(3000)
                    .duration(1000)
                    .style("opacity", 0);
            }
        });

}



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
            .attr("opacity", 0.1)
            .attr("fill-opacity", 0.1)
            .attr("stroke-opacity", 0.9)
            .attr("stroke-width", 1)
            // .attr("fill",  setDefaultFillColor)
            .attr("fill",  'blue')
            .attr("stroke", "green")
            .call(addTooltip)
        ;

    case "circle":
        return r.attr("cx", function(d){ return d.cx; })
            .attr("cy", function(d){ return d.cy; })
            .attr("r", function(d){ return d.r; })
            .attr("id", getId)
            .attr("class", getCls)
            .attr("fill-opacity", 0.2)
            .attr("stroke-width", 1)
            .attr("fill",  'blue')
            .attr("stroke", 'black')
            // .attr("fill",  setDefaultFillColor)
            // .attr("stroke", setDefaultStrokeColor)
            .call(addTooltip)
        ;

    case "line":
        return r.attr("x1", function(d){ return d.x1; })
            .attr("y1", function(d){ return d.y1; })
            .attr("x2", function(d){ return d.x2; })
            .attr("y2", function(d){ return d.y2; })
            .attr("id", getId)
            .attr("class", getCls)
            .attr("fill-opacity", 0.2)
            .attr("stroke-width", 1)
            .attr("fill",  'blue')
            .attr("stroke", 'black')
            // .attr("fill",  setDefaultFillColor)
            // .attr("stroke", setDefaultStrokeColor)
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
    return d3Page.selectAll(".shape")
        .data(dataBlock.shapes, getId) ;
}


function runTrace(tracelog) {
    let name  = tracelog.name;
    let pageStr = name.split(':')[0];
    let pageNumS = pageStr.split(' ')[1];
    let pageNum = parseInt(pageNumS) - 1;
    // console.log('tracing page ', pageStr, pageNumS, pageNum);
    pageImageWidget = pageImageListWidget.pageImageWidgets[pageNum];
    stepper.stepThrough(DrawShapes, tracelog.steps);
}

function DrawShapes(dataBlock) {
    console.log("Running OutlineMethod" );

    let shapes = selectShapes(dataBlock);

    // printlog(dataBlock.desc);

    return shapes.enter()
        .each(function (d){
            let self = d3.select(this);
            let shape = "rect";
            if (d.type != undefined) {
                shape = d.type;
            } else {
                d.type = "rect";
            }
            return self.append(shape)
                .call(initShapeAttrs) ;
        })
    ;
}



function setupTracelogMenu(tracelogs) {
    let menuItems = _.map(tracelogs, tracelog => {
        let n = tracelog.name;
        let link = t.a(n, {href: '#'});
        link.on('click', ev => {
            runTrace(tracelog);

        });

        return t.li([link]);
    });


    let menu = t.ul(menuItems);
    $('#tracelog-menu').append(menu);
    // _.each(tracelog.steps[0].shapes, shape => {
    // });
}



export function runMain() {

    frame.setupFrameLayout();

    let entry = util.corpusEntry();

    shared.currentDocument = entry;

    Promise.all([
        server.getTracelog(entry),
        server.getCorpusArtifactTextgrid(entry)
    ]) .then(([tracelogJson, textGridJson]) => {

        // console.log('tracelogJson', tracelogJson);
        let pages = textGridJson.pages;
        let textgrids = _.map(pages, p => p.textgrid);

        let gridData = rtrees.initGridData(textgrids);

        global.initGlobalMouseTracking();

        setupFrameLayout();

        pageImageListWidget = setupPageImages('page-image-list', textGridJson, gridData);

        setupTracelogMenu(tracelogJson);

    }) .catch(error => {
        $('.content-pane').append(`<div><p>ERROR: ${error}: ${error}</p></div>`);
    }) ;


}
