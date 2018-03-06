/**
 * Mouse handlers for ReflowWidget
 **/

/* global require _ watr */

import * as util from  './commons.js';
import * as coords from './coord-sys.js';
const GraphPaper = watr.utils.GraphPaper;
const Options = watr.utils.Options;
const TGI = watr.textgrid.TextGridInterop;
const LTBounds = watr.geometry.LTBounds_Companion;
const Labels = watr.watrmarks.Labels;

import * as lbl from './labeling';
import * as d3x from './d3-extras';

export function updateUserPosition(widget) {
    let handlers = {

        mouseover: function() {
            widget.hoverCell = null;
            widget.printToInfobar(2, `dim`, `${widget.colCount}x${widget.rowCount}`);
        },


        mousemove: function (d3Event){
            let userPt = coords.mkPoint.fromXy(d3Event.offsetX, d3Event.offsetY);
            let clientX = Math.floor(userPt.x);
            let clientY = Math.floor(userPt.y);

            // console.log('d3Event', d3Event);
            let focalGraphCell = widget.clientPointToGraphCell(userPt);
            let cellContent = widget.getCellContent(focalGraphCell);

            widget.printToInfobar(0, `@client`, ` (${clientX}, ${clientY})`);

            focalGraphCell.id = widget.getCellNum(focalGraphCell);
            widget.printToInfobar(1, '@dispcell', ` (${focalGraphCell.x}, ${focalGraphCell.y}) #${focalGraphCell.id}`);

            widget.userGridLocation = {
                userPt,
                clientX, clientY,
                focalGraphCell,
                cellContent
            };
            if (widget.hoverCell != null) {
                if (focalGraphCell.id != widget.hoverCell.id) {
                    widget.hoverCell = focalGraphCell;
                    widget.updateCellHoverHighlight(focalGraphCell);
                }
            } else {
                widget.hoverCell = focalGraphCell;
                widget.updateCellHoverHighlight(focalGraphCell);
            }

            if (cellContent) {
                let focalBox = GraphPaper.boundsToBox(LTBounds.FromInts(
                    cellContent.region.bounds.left,
                    cellContent.region.bounds.top,
                    cellContent.region.bounds.width,
                    cellContent.region.bounds.height
                ));
                widget.userGridLocation.focalBox = focalBox;

                if (cellContent.region.isCells()) {
                    let row = cellContent.region.row;
                    let focalCellIndex = focalGraphCell.x - focalBox.origin.x;
                    let col = focalCellIndex;
                    widget.printToInfobar(3, '@gridcell', ` (${row}, ${col})`);
                } else {
                    widget.printToInfobar(3, '@gridcell', ` --`);
                }
                widget.showLabelHighlights(cellContent);
            } else {
                widget.clearLabelHighlights();
                widget.printToInfobar(3, '@gridcell', ` --`);
            }
        }
    };

    return handlers;
}

export function labelingTool(widget) {
    return {
        mousedown: function(mouseEvent) {

            foldCellContent(widget.userGridLocation.cellContent, {
                onCells: () => {
                    let { focalGraphCell,
                          focalBox,
                          cellContent  } = widget.userGridLocation;

                    let cellRow = cellContent.region.row;
                    let focalCellIndex = focalGraphCell.x - focalBox.origin.x;
                    let cellCol = focalCellIndex;

                    if (mouseEvent.shiftKey) {
                        maybeUpdateGrid(widget, widget.textGrid.slurp(cellRow));
                    } else if (mouseEvent.ctrlKey) {
                        maybeUpdateGrid(widget, widget.textGrid.split(cellRow, cellCol));
                    } else {
                        // Add a label to the clicked row of text
                        let focalClasses = TGI.gridRegions.labels(cellContent.region);
                        let focalLabel = _.last(focalClasses) || '';
                        let childLabels = TGI.labelSchemas.childLabelsFor(widget.labelSchema, focalLabel);
                        lbl.createLabelChoiceWidget(childLabels, widget.containerId)
                            .then(choice => {
                                let labelChoice = choice.selectedLabel;
                                widget.textGrid.labelRow(cellRow, Labels.forString(labelChoice));
                                widget.redrawAll();
                            }, () => { /* Ok, user cancelled label selection */ });
                    }
                },

                onLabelCover: () => {
                    // If user clicks on a leaf (right-most) label cover indicator, delete that label
                    let { focalBox,
                          cellContent
                        } = widget.userGridLocation;
                    let focalLabels = TGI.gridRegions.labels(cellContent.region);

                    let boxRight = focalBox.shiftOrigin(2, 0);
                    let contentRight = widget.getBoxContent(boxRight);
                    let rightLabelCovers = _.filter(contentRight, c => c.region.isLabelCover());
                    let isLeafLabelCover = rightLabelCovers.length == 0;

                    if (isLeafLabelCover) {
                        let queryRight = boxRight.modifySpan(widget.colCount, 0);
                        let rightContents = widget.getBoxContent(queryRight);
                        let rightCells0 = _.filter(rightContents, c => c.region.isCells());

                        let rightCells = _.map(rightCells0, r => r.region);
                        let region0 = _.head(rightCells);
                        widget.textGrid.unlabelNear(region0.row, 0, Labels.forString(focalLabels[0]));
                        widget.redrawAll();
                    }

                }
            });

        }
    };
}


export function slicerTool(widget) {
    return {
        mousedown: function(mouseEvent) {

            foldCellContent(widget.userGridLocation.cellContent, {
                onCells: () => {
                    let { focalGraphCell,
                          focalBox,
                          cellContent  } = widget.userGridLocation;

                    let cellRow = cellContent.region.row;
                    let focalCellIndex = focalGraphCell.x - focalBox.origin.x;
                    let cellCol = focalCellIndex;

                    if (mouseEvent.shiftKey) {
                        maybeUpdateGrid(widget, widget.textGrid.slurp(cellRow));
                    } else {
                        maybeUpdateGrid(widget, widget.textGrid.split(cellRow, cellCol));
                    }
                }
            });

        }
    };
}


function doReorderDragDrop(widget) {
    let dragTextRow = widget.textReorderingState.dragSubjectTextRow;
    let dropTextRows = widget.textReorderingState.dropTargetsTextRows;
    let dragRegion = widget.cellRowToDisplayRegion[dragTextRow];
    widget.textReorderingState.dragRegion = dragRegion;

    // mouse cursor := closed hand

    return {
        mousedown: function() {},

        mousemove: function() {
            let { clientX, clientY } = widget.userGridLocation;
            widget.d3$textgridSvg
                .select('.reorder-subject')
                .attr('x', clientX)
                .attr('y', clientY)
            ;
            foldCellContent(widget.userGridLocation.cellContent, {
                onCells: () => {

                    let { cellContent  } = widget.userGridLocation;
                    let focalTextRow = cellContent.region.row;
                    let hoveringDropTarget = _.some(dropTextRows, r => r == focalTextRow);

                    if (hoveringDropTarget) {
                        widget.textReorderingState.currentDropRow = focalTextRow;
                        widget.d3$textgridSvg
                            .select('.reorder-subject')
                            .attr('opacity', 0.1) ;
                    } else {
                        widget.textReorderingState.currentDropRow = undefined;
                        widget.d3$textgridSvg
                            .select('.reorder-subject')
                            .attr('opacity', 0.4) ;
                    }

                },
                elseRun: () => {
                    widget.textReorderingState.currentDropRow = undefined;
                    widget.d3$textgridSvg
                        .select('.reorder-subject')
                        .attr('opacity', 0.4) ;

                }
            });

        },
        mouseup: function() {
            // Either drop on legal point or cancel
            let dropRow = widget.textReorderingState.currentDropRow;
            if (dropRow !== undefined) {
                let newOrdering = _.flatMap(dropTextRows, r => {
                    if (r == dropRow) {
                        if (dragTextRow < dropRow) {
                            return [dropRow, dragTextRow];
                        } else {
                            return [dragTextRow, dropRow];
                        }
                    } else {
                        return [r];
                    }
                });

                let minRow = _.min(newOrdering);


                let maybeNewTextGrid = TGI.textGrids.reorderRows(widget.textGrid, minRow, newOrdering);

                maybeUpdateGrid(widget, maybeNewTextGrid);
            }
            widget.d3$textgridSvg
                .selectAll('.reorder-region')
                .remove();

            widget.setMouseHandlers([
                updateUserPosition,
                moveLine
            ]);
        }
    };

}
export function moveLine(widget) {
    return {
        mousedown: function() {
            if (widget.textReorderingState !== undefined) {

                widget.setMouseHandlers([
                    updateUserPosition,
                    doReorderDragDrop
                ]);
            }
        },

        mousemove: function() {
            // Update drag object and drop point indicator
            foldCellContent(widget.userGridLocation.cellContent, {
                onCells: () => {
                    let { focalGraphCell,
                          focalBox,
                          cellContent  } = widget.userGridLocation;
                    let cellRow = cellContent.region.row;
                    let focalCellIndex = focalGraphCell.x - focalBox.origin.x;
                    let cellCol = focalCellIndex;
                    // Determine legal drop points for this line
                    let possibleTextRows = TGI.textGrids.findLegalReorderingRows(widget.textGrid, cellRow, cellCol);
                    // console.log('possibleTextRows', possibleTextRows);

                    if (possibleTextRows.length > 1) {
                        // Legal reorderable textGrid rows
                        let dropTargetTextRows = _.filter(possibleTextRows, r => r != cellRow);

                        widget.textReorderingState = {
                            dragSubjectTextRow: cellRow,
                            dropTargetsTextRows: dropTargetTextRows
                        };

                    } else {
                        widget.textReorderingState = undefined;
                    }
                    updateDropRegionIndicators(widget);
                },
                elseRun: () => {
                    widget.textReorderingState = undefined;
                    updateDropRegionIndicators(widget);
                }
            });
        },

        mouseup: function() {
            // Either drop on legal point or cancel
        }
    };
}

function updateDropRegionIndicators(widget) {
    widget.d3$textgridSvg
        .selectAll('.reorder-region')
        .remove();
    if (widget.textReorderingState !== undefined) {

        let dragTextRow = widget.textReorderingState.dragSubjectTextRow;
        let dropTextRows = widget.textReorderingState.dropTargetsTextRows;

        let dragRegion = widget.cellRowToDisplayRegion[dragTextRow];
        let dropRegions = _.map(dropTextRows, textRow => {
            return widget.cellRowToDisplayRegion[textRow];
        });


        _.each(dropRegions, dropRegion => {
            widget.d3$textgridSvg
                .append('rect')
                .classed('reorder-region', true)
                .classed('reorder-drop', true)
                .call(d3x.initRect, () => dropRegion)
                .call(d3x.initFill, 'blue', 0.3)
            ;
        });

        // Construct the 'grabbed' region
        widget.d3$textgridSvg
            .append('rect')
            .classed('reorder-region', true)
            .classed('reorder-subject', true)
            .call(d3x.initRect, () => dragRegion)
            .call(d3x.initFill, 'green', 0.4)
        ;

    }
}

function foldCellContent(cellContent, { onLabelCover, onCells, onLabelKey, onHeading, elseRun }) {
    let handlerRan = false;

    if (cellContent !== undefined) {
        if (cellContent.region.isLabelCover() && onLabelCover !== undefined) {
            handlerRan = true;
            onLabelCover();
        } else if (cellContent.region.isCells() && onCells !== undefined) {
            handlerRan = true;
            onCells();
        } else if (cellContent.region.isHeading() && onHeading !== undefined) {
            handlerRan = true;
            onHeading();
        } else if (cellContent.region.isLabelKey() && onLabelKey !== undefined) {
            handlerRan = true;
            onLabelKey();
        }
    }
    if (!handlerRan && elseRun !== undefined) {
        elseRun();
    }
}

function maybeUpdateGrid(widget, maybeGrid) {
    Options.fold(
        maybeGrid, () => {},
        newGrid => {
            widget.textGrid = newGrid;
            widget.redrawAll();
        });
}
