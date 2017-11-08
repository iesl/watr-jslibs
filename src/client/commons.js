/* global require location */

import * as d3 from 'd3';
import * as $ from 'jquery';
import * as _ from 'lodash';
// import * as coords from './coord-sys.js';
import * as util from './commons.js';


export let d3select = {
    pageImages: () => {
        return d3.select('div.page-images').selectAll('svg.page-image');
    },
    pageTextgrids: () => {
        return d3.select('div.page-textgrids').selectAll('svg.textgrid');
    },
    pageImage: (n) => {
        return d3.select('div.page-images').selectAll(`svg#page-image-${n}`);
    },
    allSvgs: () => {
        return d3.select('svg');
    }
};

export let filterLoci = loci => _.filter(loci,  loc => {
    return typeof loc !== "string";
});

export function selectShapes(dataBlock) {
    return d3select.allSvgs().selectAll(".shape")
        .data(dataBlock.shapes, util.getId) ;
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


export function getSelectionText() {
    let text = "";
    if (window.getSelection) {
        console.log('getSelection', window.getSelection());
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        console.log('.selection', document.selection());
        text = document.selection.createRange().text;
    }
    return text;
}

function dataToColor(d) {
    if (d.stroke !== undefined) {
        return d.stroke;
    } else if (d.class === undefined) {
        return "black";
    } else {
        return colorMap[d.class];
    }
}

function setDefaultStrokeColor(d) {
    return dataToColor(d);
}
function setDefaultFillColor(d) {
    return dataToColor(d);
}

export function getId(data) {
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

export function initShapeDimensions(r) {
    let shape = r.node().nodeName.toLowerCase();
    switch (shape) {
    case "rect":
        return r.attr("x", function(d){ return d.x; })
            .attr("y", function(d){ return d.y; })
            .attr("width", function(d){ return d.width; })
            .attr("height", function(d){ return d.height; })
            .attr("id", getId)
            .attr("class", getCls)
            .attr("fill-opacity", 0)
            .attr("stroke-opacity", 1)
            .attr("stroke-width", 1)
            .attr("stroke", 'black')
        ;

    case "circle":
        return r.attr("cx", function(d){ return d.cx; })
            .attr("cy", function(d){ return d.cy; })
            .attr("r", function(d){ return d.r; })
            .attr("id", getId)
            .attr("class", getCls)
        ;

    case "line":
        return r.attr("x1", function(d){ return d.x1; })
            .attr("y1", function(d){ return d.y1; })
            .attr("x2", function(d){ return d.x2; })
            .attr("y2", function(d){ return d.y2; })
            .attr("id", getId)
        ;
    case "image":
        return r.attr("x", function(d){ return d.x; })
            .attr("y", function(d){ return d.y; })
            .attr("width", function(d){ return d.width; })
            .attr("height", function(d){ return d.height; })
            .attr("href", function(d){ return '/entry/'+corpusEntry()+'/image/page/'+d.page; })
        ;
    }

    return r;

}
export function initShapeAttrs(r) {
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
            .attr("fill",  setDefaultFillColor)
            .attr("stroke", "green")
            // .call(addTooltip)
        ;

    case "circle":
        return r.attr("cx", function(d){ return d.cx; })
            .attr("cy", function(d){ return d.cy; })
            .attr("r", function(d){ return d.r; })
            .attr("id", getId)
            .attr("class", getCls)
            .attr("fill-opacity", 0.2)
            .attr("stroke-width", 1)
            .attr("fill",  setDefaultFillColor)
            .attr("stroke", setDefaultStrokeColor)
            // .call(addTooltip)
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
            .attr("fill",  setDefaultFillColor)
            .attr("stroke", setDefaultStrokeColor)
            // .call(addTooltip)
        ;
    case "image":
        return r.attr("x", function(d){ return d.x; })
            .attr("y", function(d){ return d.y; })
            .attr("width", function(d){ return d.width; })
            .attr("height", function(d){ return d.height; })
            .attr("href", function(d){ return '/entry/'+corpusEntry()+'/image/page/'+d.page; })
            .attr("stroke-width", 1)
            .attr("stroke", "black")
            .attr("opacity", 0.3)
        ;
    }

    return r;
}

export function corpusEntry() {
    let entry = location.href.split('/').reverse()[0].split('?')[0];
    return entry;
}

export function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[[]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

export let selectId = id => $(`#${id}`);

export function IdGenerator() {
    let currId = -1;
    let nextId = () => {
        currId +=1;
        return currId;
    };
    return nextId;
}

// TODO these don't work properly...
function appendCircle(sel, cx, cy, r) {
    return sel.append('circle')
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", r);
}

function fill(sel, clr, opacity) {
    return sel
        .attr("fill",  clr)
        .attr("fill-opacity", opacity);
}

function stroke(sel, clr, opacity) {
    return sel
        .attr("stroke",  clr)
        .attr("stroke-opacity", opacity);

}
