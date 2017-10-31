
/**
 * Attempts to make UI more responsive by batching render updates. Not working yet.
 */
function drawText(d3$svg, rowData, batchSize) {
    let d3$row = d3$svg.selectAll('text.gridrow')
        .data(rowData) ;

    console.log('drawText', rowData);
    console.log('drawText', d3$row);

    function drawBatch(batchNumber) {
        return function() {
            console.log('drawBatch', batchNumber);
            var startIndex = batchNumber * batchSize;
            console.log('drawBatch:startIndex', startIndex);
            var stopIndex = Math.min(rowData.length, startIndex + batchSize);
            // console.log('drawBatch:stopIndex', stopIndex);
            // console.log('drawBatch:row', d3$row);
            // console.log('drawBatch:row[0]', d3$row[0]);
            // console.log('drawBatch:row.enter()', d3$row.enter());
            // console.log('drawBatch:row.enter()._groups', d3$row.enter()._groups);
            console.log('drawBatch:row.enter()._groups[0]', d3$row.enter()._groups[0]);
            console.log('drawBatch:row.enter()._groups[0][0]', d3$row.enter()._groups[0][0]);


            var enterSelection = d3.selectAll(d3$row.enter()._groups[0].slice(startIndex, stopIndex));
            var updateSelection = d3.selectAll(d3$row._groups.slice(startIndex, stopIndex));
            // var exitSelection = d3.selectAll(d3$row._exit[0].slice(startIndex, stopIndex));

            enterSelection.each(function(d, i) {

                // console.log('enterSelection:each i:', i, 'data:', d);
                let d3$newElement = d3$row.append('text').classed('gridrow', true)
                    .attr("y", (d, i) => 20 + (i * 16))
                    .attr("x", () => 40)
                    .attr("style", "font: normal normal normal 12px/normal Helvetica, Arial;")
                    .text(function(d){ return "∙  " + d.text + "  ↲"; })
                // .call(textGridLocationIndicator)
                ;

                let newElement = d3$newElement._groups[0];
                console.log('newElement', d3$newElement);
                console.log('newElement', newElement);

                // d3$gridrows
                //     .selectAll('.gridcell')
                //     .data(d => d.text.split(''))
                //     .enter()
                //     .append('tspan').classed('.gridcell', true)
                //     .text(d => { return d; })
                // ;


                // var newElement = svg.append('circle')[0][0];
                enterSelection._groups[i] = newElement;
                updateSelection._groups[i] = newElement;
                newElement.__data__ = this.__data__;
            }).attr('r', 3);

            // exitSelection.remove();

            // updateSelection
            //     .attr('cx', function(d) { return d.x; })
            //     .attr('cy', function(d) { return d.y; });

            if (stopIndex < rowData.length) {
                setTimeout(drawBatch(batchNumber + 1), 0);
            }
        };
    }

    setTimeout(drawBatch(0), 0);
}
