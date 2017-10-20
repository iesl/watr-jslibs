
define(['/js/d3.js', '/js/underscore-min.js', './commons.js'], function (d3, us, util) {

    let svgs = () => d3.selectAll('svg');

    let getX = d => d[0][1][0] / 100.0;
    let getY = d => d[0][1][1] / 100.0;
    let getW = d => d[0][1][2] / 100.0;
    let getH = d => d[0][1][3] / 100.0;

    let filterLoci = loci => _.filter(loci,  loc => {
        return typeof loc !== "string";
    });

    function selectShapes(dataBlock) {
        return svgs().selectAll(".shape")
            .data(dataBlock.shapes, util.getId) ;
    }

    function textGridLocationIndicator(r) {
        return r
            .on("mousedown", function(d) {
                console.log('mousedown', d);
            })
            .on("mouseup", function(d) {
                let selection = util.getSelectionText();
                console.log('selected: ', d,  selection);
                // let loci = filterLoci(d.loci);
            })
            .on("mouseover", function(d) {
                let loci = filterLoci(d.loci);

                // #d3-chain-indent#
                svgs().selectAll('.textloc')
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
                return svgs().selectAll('.textloc')
                    .remove();
            });

    }

    function RenderTextGridPerCell (dataBlock) {
        console.log("Running TextGridMethod" );

        let gridRows = dataBlock.grid.rows;
        let gridShapes = dataBlock.shapes;

        svgs().selectAll(".shape")
            .data(gridShapes, util.getId)
            .enter()
            .each(function (d){
                var self = d3.select(this);
                let shape = d.type;
                return self.append(shape)
                    .call(util.initShapeAttrs);
            })
        ;
        svgs().selectAll("image")
            .attr("opacity", 1.0)
        ;

        // RenderTextGridPerLine version:
        // return svgs().selectAll('.gridrow')
        //     .data(gridRows)
        //     .enter()
        //     .append('text')
        //     .classed('gridrow', true)
        //     .attr("y", function(d, i){ return 20 + (i * 16); })
        //     .attr("x", function(d, i){ return 700; })
        //     .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
        //     .text(function(d, i){ return d.text; })
        //     .call(textGridLocationIndicator)
        // ;

        // RenderTextGridPerCell version:
        let gridrowSel = svgs().selectAll('.gridrow')
              .data(gridRows)
            .enter()
              .append('text').classed('gridrow', true)
              .attr("y", function(d, i){ return 20 + (i * 15); })
              .attr("x", function(d, i){ return 700; })
        ;

        let getChar = d => d[0][2];

        let gridcellSel = gridrowSel.selectAll('.gridcell')
            .data(function(d, i) { return d.loci; })
            .enter()
            .append('tspan').classed('gridcell', true)
            .attr("x", function(d, i){ return 700 + (7*i); })
            .attr("style", "font-family: Courier, monospace; font-size: 12px;")
            .text(function(d, i){ return getChar(d); })
            .call(textGridLocationIndicator)
        ;

        return gridcellSel;

    }

    function MockupMultiPageTextGrid(dataBlock) {

        let gridRows = dataBlock.grid.rows;
        let gridShapes = dataBlock.shapes;

        let leftPane = d3.select('#left-content')
            .append('svg').classed('page-image', true)
            .attr('width', 600)
            .attr('height', 2000)
        ;
        let rightPane = d3.select('#right-content')
            .append('svg').classed('page-text', true)
            .attr('width', 800)
            .attr('height', 2000)
        ;


        leftPane.selectAll(".shape")
            .data(gridShapes, util.getId)
            .enter()
            .each(function (d){
                let self = d3.select(this);
                let shape = d.type;
                return self.append(shape)
                    .call(util.initShapeAttrs);
            })
        ;
        leftPane.selectAll("image")
            .attr("opacity", 1.0)
        ;

        return rightPane.selectAll('.gridrow')
            .data(gridRows)
            .enter()
            .append('text')
            .classed('gridrow', true)
            .attr("y", function(d, i){ return 20 + (i * 16); })
            .attr("x", function(d, i){ return 70; })
            .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
            .text(function(d, i){ return "∙  " + d.text + "  ↲"; })
            .call(textGridLocationIndicator)
        ;

    }

    function RenderTextGridPerLine (dataBlock) {
        console.log("Running TextGridMethod" );

        let gridRows = dataBlock.grid.rows;
        let gridShapes = dataBlock.shapes;

        svgs().selectAll(".shape")
            .data(gridShapes, util.getId)
            .enter()
            .each(function (d){
                let self = d3.select(this);
                let shape = d.type;
                return self.append(shape)
                    .call(util.initShapeAttrs);
            })
        ;
        svgs().selectAll("image")
            .attr("opacity", 1.0)
        ;
        return svgs().selectAll('.gridrow')
            .data(gridRows)
            .enter()
            .append('text')
            .classed('gridrow', true)
            .attr("y", function(d, i){ return 20 + (i * 16); })
            .attr("x", function(d, i){ return 700; })
            .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
            .text(function(d, i){ return "∙  " + d.text + "  ↲"; })
            .call(textGridLocationIndicator)
        ;

    }




    return {
        RenderTextGrid: MockupMultiPageTextGrid,
        selectShapes: selectShapes
    };

});
