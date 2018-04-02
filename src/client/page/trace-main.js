/**
 *
 **/

/* global */

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
import ToolTips from '../lib/Tooltips';
import * as Rx from 'rxjs';
import * as coords from '../lib/coord-sys.js';

import {t, htm} from '../lib/jstags.js';


let _tooltipHoversRx = new Rx.Subject();
let tooltips = new ToolTips('body', _tooltipHoversRx);

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


function addTooltip(r) {
    return r.on("mouseover", function(d) {
        r .call(d3x.initStroke, 'yellow', 1, 2.0)
            .transition().duration(200)
            .call(d3x.initStroke, 'red', 1.0)
            .call(d3x.initFill, 'red', 1.0)
        ;

    }) .on("mouseout", function(d) {
        r .transition().duration(300)
            .call(d3x.initStroke, 'black', 2)
            .call(d3x.initFill, 'blue', 0.2)
        ;
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
    // console.log('initShapeAttrs', r);
    // console.log('initShapeAttrs (shape)', shape);

    switch (shape) {
    case "rect":
        return r.attr("x", function(d){ return d.x; })
            .attr("y", function(d){ return d.y; })
            .attr("width", function(d){ return d.width; })
            .attr("height", function(d){ return d.height; })
            .attr("id", getId)
            .attr("class", getCls)
            .attr("label", getCls)
            .attr("opacity", 0.1)
            .attr("fill-opacity", 0.2)
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
    // let filteredShapes = _.filter(dataBlock.shapes, s => {
    //     return s.class !== undefined &&  s.type != 'image';
    // });
    // console.log('shapes', dataBlock.shapes);

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

    // let pageId = pageImageWidget.svgId;
    // let d3Page = d3.select(`#${pageId}`);
    // d3Page.selectAll('rect.backdrop').remove();

    // d3Page .append('rect')
    //     .datum(pageImageWidget.pageBounds)
    //     .classed('backdrop', true)
    //     .call(initShapeAttrs)
    //     .call(d3x.initFill, () => 'white', 0.7)
    // ;

    let decodedShapes = _.map(tracelog.log.log, s => coords.fromFigure(s).svgShape());

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



function setupTracelogMenu(tracelogs) {
    let filterMenu = htm.labeledTextInput('Filter', 'trace-filter');

    let taggedTraces = _.map(tracelogs, tracelog => {
        let {log, page} = tracelog;
        let tags = `p${page+1}. ${log.tags.toLowerCase()}`;
        return [tags, tracelog];
    });

    function makeMenuItems(traces) {
        let lis = _.map(traces, tracelog => {
            let {log, page} = tracelog[1];
            // let n = tracelog.name;
            let {callSite} = log;
            let n = t.span([t.small(`p${page+1}: ${log.tags} @ ${callSite}`)]);
            let link = t.a(n, {href: '#'});
            link.on('click', ev => {
                runTrace(tracelog);
            });

            return t.li([link]);
        });

        return t.ul(lis);
    }

    let menu = makeMenuItems(taggedTraces);

    let traceControls = t.div([
        filterMenu,
        t.div('#trace-menu', [
            menu
        ])
    ]);

    let filteredTraces = taggedTraces;

    $('#tracelog-menu').append(traceControls);

    $('#trace-filter').on('keypress', function(e) {
        if (e.keyCode == 13) {
            runAllTraces(_.map(filteredTraces, t => t[1]));
            return false;
        }
    });

    $('#trace-filter').on('input', function(ev) {
        // let textVal = $('#trace-filter').val();
        let textVal = $(this).val();
        $('#trace-menu').empty();
        if (textVal.length>0) {
            let filterExprs = textVal.toLowerCase().split(' ');
            filteredTraces = _.filter(taggedTraces, ([tags, trace]) => {
                return _.every(filterExprs, expr => {
                    return tags.includes(expr);
                });
            });
        } else {
            filteredTraces = taggedTraces;
        }
        let ms = makeMenuItems(filteredTraces);
        $('#trace-menu').append(ms);
    });
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
