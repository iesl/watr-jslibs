/**
 *
 */

/* global d3 */


/**
   Given a dragSubject (by id), and a list of legal drop targets [ {d3$obj, id}, ... ],
   return promise  that resolves on changed ordering, or rejects on unchanged ordering
*/

export function reorder(sortablesSelector) {
    return new Promise((resolve, reject) => {
        let dragTarget;
        let drag = d3.drag()
            .on('start', function(d) {
                dragTarget = d3.select(d3.event.sourceEvent.target);
                console.log('drag:start', dragTarget);


                d3.selectAll(sortablesSelector)
                    .filter(d => d.attr('id') != dragTarget.attr('id'))
                    .on('mouseover', function() {
                        let hovered = d3.select(this);
                        hovered.attr('fill-opacity', 0.1)
                    })
                    .on('mouseout', function() {
                        let hovered = d3.select(this);
                        hovered.attr('fill-opacity', 0.4)
                    })
                ;

            })
            .on('drag', function(d) {
                let {x, y, dx, dy, translate}  = d3.event;
                console.log('drag:drag', d);
                let b = d.bounds;
                b.x0 += dx;
                b.y0 += dy;

                dragTarget
                    .attr("d", d => {
                        return `M ${b.x0} ${b.y0} l ${b.width} 0 0 ${b.height} ${-b.width} 0 Z`;
                    })
                ;
            })
            .on('end', function(d) {
                console.log('drag:end');
                // d3.selectAll(sortablesSelector).on(".drag", null);
                resolve();
            });


        d3.selectAll(sortablesSelector)
            .call(drag);
    });
}
