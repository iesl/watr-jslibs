/* global require $ */


import * as d3 from  'd3';
import * as panes from  './splitpane-utils.js';
import * as util from  './commons.js';
import * as tg from  './textgrid.js';

import '../style/main.css';
import '../style/split-pane.css';
import '../style/pretty-split-pane.css';
import '../style/selection.css';
import '../style/bootstrap.css';

let selectId = util.selectId;

let DrawingMethods = drawingMethods();

function drawingMethods() {

    // function DrawMethod(dataBlock) {
    //     console.log("Running DrawMethod" );

    //     let rects = tg.selectShapes(dataBlock);

    //     printlog(dataBlock.desc);

    //     return rects.enter()
    //         .each(function (d){
    //             let self = d3.select(this);
    //             let shape = "???";
    //             if (d.type != undefined) {
    //                 shape = d.type;
    //             } else {
    //                 d.type = "rect";
    //             }
    //             self.append(shape)
    //                 .call(util.initShapeAttrs) ;
    //             return self;
    //         })
    //         .merge(rects)
    //     ;

    // }

    // function OutlineMethod(dataBlock) {

    //     console.log("Running OutlineMethod" );

    //     let shapes = tg.selectShapes(dataBlock);

    //     printlog(dataBlock.desc);

    //     return shapes.enter()
    //         .each(function (d){
    //             let self = d3.select(this);
    //             let shape = "rect";
    //             if (d.type != undefined) {
    //                 shape = d.type;
    //             } else {
    //                 d.type = "rect";
    //             }
    //             return self.append(shape)
    //                 .call(util.initShapeAttrs) ;
    //         })
    //     ;


    // }

    // function RemoveMethod (dataBlock) {
    //     console.log("Running RemoveMethod" );

    //     printlog(dataBlock.desc);

    //     _.each(dataBlock.shapes, function(shape){
    //         svg.selectAll("#" + shape.id )
    //             .attr('class', 'trash');
    //     });

    //     return svg.selectAll(".trash")
    //         .remove() ;
    // }

    return {
        'DocumentTextGrid' : tg.RenderTextGrid
        // 'Draw'     : DrawMethod,
        // 'Outline'  : OutlineMethod,
        // 'Remove'   : RemoveMethod,
        // 'Clear'    : RemoveMethod
    };
}


// let messages = [""];

// function printlog(msg) {
//     messages.push(msg);
//     console.log(msg);

//     svg.select('g.log')
//         .selectAll('text.log')
//         .data(messages)
//         .enter()
//         .append("text").classed('log', true)
//         .attr("y", function(d, i){ return 100 + (i * 20); })
//         .attr("x", function(d){ return 700; })
//         .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
//         .text(function(d, i){ return "> " + d; })
//     ;
//     return 0;
// }


function onEndAll (transition, callback) {

    if (transition.empty()) {
        callback();
    } else {
        let n = transition.size();
        transition.on("end", function () {
            n--;
            if (n === 0) {
                callback();
            }
        });
    }
}

function stepper (steps) {
    if (steps.length > 0) {
        let step = steps[0];

        let method = DrawingMethods[step.Method];

        method(step)
            .transition()
            .delay(300)
            .call(onEndAll, function(){
                stepper(steps.slice(1));
            });
    }
}


function runLog(logData) {
    stepper(logData.steps);
}

function parseMultilog(multilog) {
    if (multilog.length == 1) {
        // svg.selectAll('text.loglink').remove();
        runLog(multilog[0]);
    } else {
        // let logLinks = svg.selectAll("text.loglink")
        //     .data(multilog)
        // ;

        // logLinks.enter()
        //     .append("text").classed('loglink', true)
        //     .attr("y", function(d, i){ return 20 + (i * 20); })
        //     .attr("x", function(d, i){ return 100 ; })
        //     .attr("style", "font: normal normal normal 14px/normal Helvetica, Arial;")
        //     .text(function(d, i){ return i + ": " + d.name; })
        //     .on("click", function(pdata, pi, nodes) {
        //         svg.selectAll('text.loglink').remove();
        //         runLog(pdata);
        //     })
        // ;


    }
    return;
}

function setupMenubar() {
    let menuBarList = d3.select('.menu-pane')
        .append('ul').classed('menubar', true);

    menuBarList
        .append('li')
        .append('a')
        .attr('href', '/')
        .text('Browse')
    ;

}


export function runTrace() {
    let splitPaneRootId = panes.createSplitPaneRoot("#content");

    let {topPaneId: topPaneId, bottomPaneId: bottomPaneId} =
        panes.splitHorizontal(splitPaneRootId, {fixedTop: 40});


    selectId(topPaneId).addClass('menu-pane');
    selectId(bottomPaneId).addClass('content-pane');

    setupMenubar();

    let entry = util.corpusEntry();
    let show = util.getParameterByName('show');

    d3.json(`/vtrace/json/${entry}/${show}`, function(error, jsval) {
        if (error) {
            $('.content-pane').append(`<div><p>ERROR: ${error}: ${error.target.responseText}</p></div>`);
        } else {
            parseMultilog(jsval);
        }

        return;
    });

}

runTrace();
