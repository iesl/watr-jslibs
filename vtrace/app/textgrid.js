/* global require define _ $ */

define(['./commons.js', './splitpane-utils.js'], function (util, panes) {
    let d3 = require('/js/d3.js');

    let svgs = () => d3.selectAll('svg');
    let pageImageSelector = () => d3.select('div.page-images').selectAll('svg.page-image');

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

    function syncScrollPageImages(coords, loci) {
        // console.log('mousedown', coords);

        // Use first location as sync point
        let headLoc = loci[0];
        let pageNum = headLoc[0][0];
        let pdfTextY = getY(headLoc);
        let pdfTextH = getH(headLoc);
        // console.log('pdf text y', pdfTextY);

        // Get visible abs Y-position of user click:
        let pageTextTop = $(`#page-textgrid-${pageNum}`).parent().position().top;
        let pageTextClickY = coords[1];
        let pageTextsOffset = $('div.page-textgrids').position().top;
        let userAbsY = pageTextTop + pageTextClickY + pageTextsOffset;
        // console.log('userAbsY', userAbsY);

        // let clickY = textgridPos.top + coords[1];
        // let clickedTextOffset = clickY;
        // console.log('textgridsPos', textgridsPos);
        // console.log('textgridPos', textgridPos);
        // console.log('clickY', clickY);
        // console.log('clickedTextOffset', clickedTextOffset);


        // Get offset of clicked text on page
        // let pageImagesOffset = $('div.page-images').position().top;
        let pageImageTop = $(`#page-image-${pageNum}`).parent().position().top;
        // console.log('pageImageTop', pageImageTop);

        let scrollTo = pageImageTop + pdfTextY - pdfTextH - 10 - userAbsY;
        // let scrollTo = pageImageTop + pdfTextY - pdfTextH - 10 ;
        // console.log('pageSvgId', pageSvgId);
        // console.log('page image top', pageTop, 'images top', imagesTop, 'scrolling to', scrollTo, 'pageY', pageY);
        // console.log('scrolling to', scrollTo);

        $('#splitpane_root__bottom__left').scrollTop(scrollTo);
    }

    function textGridLocationIndicator(r) {
        return r
            .on("mousedown", function(d) {
                let loci = filterLoci(d.loci);
                let coords = d3.mouse(this);
                syncScrollPageImages(coords, loci);
            })
            .on("mouseup", function(d) {
                let selection = util.getSelectionText();
                console.log('selected: ', d,  selection);
                // let loci = filterLoci(d.loci);
            })
            .on("mouseover", function(d) {
                let loci = filterLoci(d.loci);
                // console.log('mouseover: ', d.loci);

                // #d3-chain-indent#
                pageImageSelector().selectAll('.textloc')
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
                return pageImageSelector().selectAll('.textloc')
                    .remove();
            });

    }


    function setupPageTexts(contentId, textgrids) {

        let textgridsel = d3.select(contentId)
            .selectAll(".textgrid")
            .data(textgrids, util.getId)
            .enter()
            .append('div').classed('page-textgrid', true)
            .append('svg').classed('textgrid', true)
            .attr('id', (d, i) => `page-textgrid-${i}`)
            .attr('width', 600)
            .attr('height', grid => {
                return grid.rows.length * 18;
            })
        ;

        return textgridsel.selectAll('.gridrow')
            .data(d => d.rows)
            .enter()
            .append('text') .classed('gridrow', true)
            .attr("y", (d, i) => 20 + (i * 16))
            .attr("x", () => 40)
            .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
            .text(function(d, i){ return "∙  " + d.text + "  ↲"; })
            .call(textGridLocationIndicator)
        ;
    }

    function setupPageImages(contentId, pageImageShapes) {

        let ctx = {maxh: 0, maxw: 0};

        _.map(pageImageShapes, (sh) =>{
            ctx.maxh = Math.max(ctx.maxh, sh[0].height);
            ctx.maxw = Math.max(ctx.maxw, sh[0].width);
        });

        panes.setParentPaneWidth(contentId, ctx.maxw+30);

        d3.select(contentId).selectAll(".page-image")
            .data(pageImageShapes, util.getId)
            .enter()
            .append('div').classed('page-image', true)
            .append('svg').classed('page-image', true)
            .attr('id', (d, i) => `page-image-${i}`)
            .attr('width', (d) => d[0].width)
            .attr('height', (d) => d[0].height)
            .selectAll(".shape")
            .data(d => d)
            .enter()
            .each(function (d){
                let self = d3.select(this);
                let shape = d.type;
                return self.append(shape)
                    .call(util.initShapeAttrs);
            })
        ;
    }

    function MockupMultiPageTextGrid(dataBlock) {
        let pages = dataBlock.pages;
        let textgrids = _.map(pages, p => p.textgrid);
        let pageShapes = _.map(pages, p => p.shapes);

        let {leftPaneId: leftPaneId, rightPaneId: rightPaneId} =
            panes.splitVertical('.content-pane', {fixedLeft: 200});


        let leftContent = d3.select(`#${leftPaneId}`)
            .append('div').classed('page-images', true)
        ;

        let rightContent = d3.select(`#${rightPaneId}`)
            .append('div').classed('page-textgrids', true)
        ;

        setupPageImages('div.page-images', pageShapes);
        setupPageTexts('div.page-textgrids', textgrids);

        // leftPane.selectAll(".shape")
        //     .data(gridShapes, util.getId)
        //     .enter()
        //     .each(function (d){
        //         let self = d3.select(this);
        //         let shape = d.type;
        //         return self.append(shape)
        //             .call(util.initShapeAttrs);
        //     })
        // ;

        leftContent.selectAll("image")
            .attr("opacity", 1.0)
        ;

        // return rightPane.selectAll('.gridrow')
        //     .data(gridRows)
        //     .enter()
        //     .append('text')
        //     .classed('gridrow', true)
        //     .attr("y", function(d, i){ return 20 + (i * 16); })
        //     .attr("x", function(d, i){ return 70; })
        //     .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
        //     .text(function(d, i){ return "∙  " + d.text + "  ↲"; })
        //     .call(textGridLocationIndicator)
        // ;

        // return leftPane.selectAll('.gridrow');
        return d3;

    }



    return {
        RenderTextGrid: MockupMultiPageTextGrid,
        DocumentTextGrid: MockupMultiPageTextGrid,
        selectShapes: selectShapes
    };

});


    // function RenderTextGridPerLine (dataBlock) {
    //     console.log("Running TextGridMethod" );

    //     let gridRows = dataBlock.grid.rows;
    //     let gridShapes = dataBlock.shapes;

    //     svgs().selectAll(".shape")
    //         .data(gridShapes, util.getId)
    //         .enter()
    //         .each(function (d){
    //             let self = d3.select(this);
    //             let shape = d.type;
    //             return self.append(shape)
    //                 .call(util.initShapeAttrs);
    //         })
    //     ;
    //     svgs().selectAll("image")
    //         .attr("opacity", 1.0)
    //     ;
    //     return svgs().selectAll('.gridrow')
    //         .data(gridRows)
    //         .enter()
    //         .append('text')
    //         .classed('gridrow', true)
    //         .attr("y", function(d, i){ return 20 + (i * 16); })
    //         .attr("x", function(d, i){ return 700; })
    //         .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
    //         .text(function(d, i){ return "∙  " + d.text + "  ↲"; })
    //         .call(textGridLocationIndicator)
    //     ;

    // }


    // function RenderTextGridPerCell (dataBlock) {
    //     console.log("Running TextGridMethod" );

    //     let gridRows = dataBlock.grid.rows;
    //     let gridShapes = dataBlock.shapes;

    //     svgs().selectAll(".shape")
    //         .data(gridShapes, util.getId)
    //         .enter()
    //         .each(function (d){
    //             var self = d3.select(this);
    //             let shape = d.type;
    //             return self.append(shape)
    //                 .call(util.initShapeAttrs);
    //         })
    //     ;
    //     svgs().selectAll("image")
    //         .attr("opacity", 1.0)
    //     ;

    //     // RenderTextGridPerLine version:
    //     // return svgs().selectAll('.gridrow')
    //     //     .data(gridRows)
    //     //     .enter()
    //     //     .append('text')
    //     //     .classed('gridrow', true)
    //     //     .attr("y", function(d, i){ return 20 + (i * 16); })
    //     //     .attr("x", function(d, i){ return 700; })
    //     //     .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
    //     //     .text(function(d, i){ return d.text; })
    //     //     .call(textGridLocationIndicator)
    //     // ;

    //     // RenderTextGridPerCell version:
    //     let gridrowSel = svgs().selectAll('.gridrow')
    //           .data(gridRows)
    //         .enter()
    //           .append('text').classed('gridrow', true)
    //           .attr("y", function(d, i){ return 20 + (i * 15); })
    //           .attr("x", function(d, i){ return 700; })
    //     ;

    //     let getChar = d => d[0][2];

    //     let gridcellSel = gridrowSel.selectAll('.gridcell')
    //         .data(function(d, i) { return d.loci; })
    //         .enter()
    //         .append('tspan').classed('gridcell', true)
    //         .attr("x", function(d, i){ return 700 + (7*i); })
    //         .attr("style", "font-family: Courier, monospace; font-size: 12px;")
    //         .text(function(d, i){ return getChar(d); })
    //         .call(textGridLocationIndicator)
    //     ;

    //     return gridcellSel;

    // }
