
define(['/lib/d3.js', '/lib/underscore-min.js'], function (d3, us) {

    console.log('d3', d3);
    console.log('us', _);


    let colorMap = {
        "Caption"                : "blue",
        "Image"                  : "brown",
        "CharRun"                : "chocolate",
        "CharRunBegin"           : "purple",
        "CharRunBaseline"        : "purple",
        "VisualBaseline"         : "blue",
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

    colorMap

    var svg = d3.select('#main') ;

    var DrawingMethods = drawingMethods();

    function selectShapes(dataBlock) {
        return svg.selectAll(".shape")
            .data(dataBlock.shapes, getId) ;
    }


    function drawingMethods() {

        function DrawMethod(dataBlock) {
            console.log("Running DrawMethod" );

            var rects = selectShapes(dataBlock);

            printlog(dataBlock.desc);

            return rects.enter()
                .each(function (d){
                    var self = d3.select(this);
                    var shape = "???";
                    if (d.type != undefined) {
                        shape = d.type;
                    } else {
                        d.type = "rect";
                    }
                    self.append(shape)
                        .call(initShapeAttrs) ;
                    return self;
                })
                .merge(rects)
            ;

        }

        function OutlineMethod(dataBlock) {

            console.log("Running OutlineMethod" );

            var shapes = selectShapes(dataBlock);

            printlog(dataBlock.desc);

            return shapes.enter()
                .each(function (d){
                    var self = d3.select(this);
                    var shape = "rect";
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

        function RemoveMethod (dataBlock) {
            console.log("Running RemoveMethod" );

            printlog(dataBlock.desc);

            _.each(dataBlock.shapes, function(shape){
                svg.selectAll("#" + shape.id )
                    .attr('class', 'trash');
            });

            return svg.selectAll(".trash")
                .remove() ;
        }

        function TextGridMethod (dataBlock) {
            console.log("Running TextGridMethod" );

            let gridRows = dataBlock.grid.rows;
            let gridShapes = dataBlock.shapes;

            svg.selectAll(".shape")
                .data(gridShapes, getId)
                .enter()
                .each(function (d){
                    var self = d3.select(this);
                    let shape = d.type;
                    return self.append(shape)
                        .call(initShapeAttrs);
                })
            ;
            svg.selectAll("image")
                .attr("opacity", 1.0)
            ;

            return svg.selectAll('.gridrow')
                .data(gridRows)
                .enter()
                .append('text')
                .classed('gridrow', true)
                .attr("y", function(d, i){ return 20 + (i * 16); })
                .attr("x", function(d, i){ return 700; })
                .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
                .text(function(d, i){ return d.text; })
                .call(textGridLocationIndicator)
            ;

        }

        return {
            'TextGrid' : TextGridMethod,
            'Draw'     : DrawMethod,
            'Outline'  : OutlineMethod,
            'Remove'   : RemoveMethod,
            'Clear'    : RemoveMethod
        };
    }

    let getX = d => d[0][1][0] / 100.0;
    let getY = d => d[0][1][1] / 100.0;
    let getW = d => d[0][1][2] / 100.0;
    let getH = d => d[0][1][3] / 100.0;

    function textGridLocationIndicator(r) {
        return r
            .on("mouseover", function(d) {
                let loci = _.filter(d.loci,  loc => {
                    return typeof loc !== "string";
                });

                // #d3-chain-indent#
                svg.selectAll('.textloc')
                      .data(loci)
                    .enter()
                      .append('rect')
                      .classed('textloc', true)
                      .attr("x", getX)
                      .attr("y", (d) => {return getY(d)-getH(d);})
                      .attr("width", getW)
                      .attr("height", getH)
                      .attr("opacity", 0.4)
                      .attr("fill-opacity", 0.5)
                      .attr("stroke-width", 0)
                      .attr("stroke", 'blue')
                      .attr("fill", 'blue')
                ;

            }).on("mouseout", function(d) {
                return svg.selectAll('.textloc')
                    .remove();
            });

    }

    var messages = [];

    function printlog(msg) {
        messages.push(msg);
        console.log(msg);

        svg.select('g.log')
            .selectAll('text.log')
            .data(messages)
            .enter()
            .append("text").classed('log', true)
            .attr("y", function(d, i){ return 100 + (i * 20); })
            .attr("x", function(d, i){ return 700; })
            .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
            .text(function(d, i){ return "> " + d; })
        ;


        return 0;
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

    function getId(data) {
        var shape = data.type;

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
        if (data.class != undefined) {
            return "shape " + data.class;
        } else {
            return "shape";
        }

    }



    // Define the div for the tooltip
    var tooltipDiv = d3.select("body").append("div")
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


    function initShapeAttrs(r) {
        var shape = r.node().nodeName.toLowerCase();

        switch (shape) {
        case "rect":
            return r.attr("x", function(d){ return d.x; })
                .attr("y", function(d){ return d.y; })
                .attr("width", function(d){ return d.width; })
                .attr("height", function(d){ return d.height; })
                .attr("id", getId)
                .attr("class", getCls)
                .attr("opacity", 0.3)
                .attr("fill-opacity", 0.1)
                .attr("stroke-width", 1)
                .attr("fill",  setDefaultFillColor)
                .attr("stroke", setDefaultStrokeColor)
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
                .attr("fill-opacity", 0.2)
                .attr("stroke-width", 1)
                .attr("fill",  setDefaultFillColor)
                .attr("stroke", setDefaultStrokeColor)
                .call(addTooltip)
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
        };

        return r;
    }

    function onEndAll (transition, callback) {

        if (transition.empty()) {
            callback();
        }
        else {
            var n = transition.size();
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
            var step = steps[0];

            var method = DrawingMethods[step.Method];

            method(step)
                .transition()
                .delay(300)
                .call(onEndAll, function(){
                    stepper(steps.slice(1));
                });
        }
    }

    function corpusEntry() {
        let entry = location.href.split('/').reverse()[1];
        return entry;
    }

    function corpusLogfile() {
        let entry = location.href.split('/').reverse()[0];
        return entry;
    }

    function runLog(logData) {
        console.log("runLog", logData.steps);
        stepper(logData.steps);
    }

    function parseMultilog(multilog) {
        if (multilog.length == 1) {
            svg.selectAll('text.loglink').remove();
            runLog(multilog[0]);
        } else {
            var logLinks = svg.selectAll("text.loglink")
                .data(multilog)
            ;

            logLinks.enter()
                .append("text").classed('loglink', true)
                .attr("y", function(d, i){ return 20 + (i * 20); })
                .attr("x", function(d, i){ return 100 ; })
                .attr("style", "font: normal normal normal 14px/normal Helvetica, Arial;")
                .text(function(d, i){ return i + ": " + d.name; })
                .on("click", function(pdata, pi, nodes) {
                    svg.selectAll('text.loglink').remove();
                    runLog(pdata);
                })
            ;


        }
        return;
    }

    function runTrace() {
        let entry = corpusEntry();
        let log = corpusLogfile();
        console.log('entry', entry);
        console.log('log', log);
        d3.json("/vtrace/json/"+entry+"/"+log, function(error, jsval) {

            if (error) {
                console.log('error', error);
                console.log('error', error.target.responseText);
                throw error;
            }

            parseMultilog(jsval);

            return;
        });

    }

return {
    run: runTrace
};

});
