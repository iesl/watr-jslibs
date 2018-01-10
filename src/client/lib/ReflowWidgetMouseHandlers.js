/**
 * Mouse handlers for ReflowWidget
 **/

/* global require _ d3 watr */

import * as coords from './coord-sys.js';
const GraphPaper = watr.utils.GraphPaper;
const Options = watr.utils.Options;
const TGI = watr.textgrid.TextGridInterop;
const LTBounds = watr.geometry.LTBounds_Companion;
const Labels = watr.watrmarks.Labels;

import * as lbl from './labeling';

export function updateUserPosition(widget) {
    let handlers = {

        init: () => {
            widget.hoverCell = null;
            widget.printToInfobar(2, `dim`, `${this.colCount}x${this.rowCount}`);
        },


        mousemove: function (d3Event){
            let userPt = coords.mkPoint.fromXy(d3Event.layerX, d3Event.layerY);
            let clientX = Math.floor(userPt.x);
            let clientY = Math.floor(userPt.y);

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

export function labelingToolHandlers(widget) {
    let handlers = {
        mousedown: function(mouseEvent) {

            let { focalGraphCell,
                  focalBox,
                  cellContent
                } = widget.userGridLocation;

            if (cellContent) {

                let focalLabels = TGI.gridRegions.labels(cellContent.region);

                if (cellContent.region.isLabelCover()) {
                    // If user clicks on a leaf (right-most) label cover indicator, delete that label

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

                } else if (cellContent.region.isCells()) {
                    let cellRow = cellContent.region.row;
                    let focalCellIndex = focalGraphCell.x - focalBox.origin.x;
                    let cellCol = focalCellIndex;

                    if (mouseEvent.shiftKey) {
                        let maybeGrid = widget.textGrid.slurp(cellRow);

                        Options.fold(
                            maybeGrid, () => {},
                            newGrid => {
                                widget.textGrid = newGrid;
                                widget.redrawAll();
                            });

                    } else if (mouseEvent.ctrlKey) {
                        let maybeGrid = widget.textGrid.split(cellRow, cellCol);

                        Options.fold(
                            maybeGrid, () => {},
                            newGrid => {
                                widget.textGrid = newGrid;
                                widget.redrawAll();
                            });

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
                            }, () => {
                                // Ok, user cancelled label selection
                            });
                    }
                }
            }
        }
    };

    return handlers;
}

function slicerToolHandlers() {

}

function reorderTextHandlers() {

}
