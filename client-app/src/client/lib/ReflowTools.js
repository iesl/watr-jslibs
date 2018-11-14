"use strict";
/**
 * Mouse handlers for ReflowWidget
 **/
exports.__esModule = true;
/* global require watr */
var _ = require("lodash");
var coords = require("./coord-sys");
var GraphPaper = watr.utils.GraphPaper;
var Options = watr.utils.Options;
var TGI = watr.textgrid.TextGridInterop;
var LTBounds = watr.geometry.LTBounds_Companion;
var Labels = watr.watrmarks.Labels;
var lbl = require("./labeling");
var d3x = require("./d3-extras");
function updateUserPosition(widget) {
    var handlers = {
        mouseover: function () {
            widget.hoverCell = null;
            widget.printToInfobar(2, "dim", widget.colCount + "x" + widget.rowCount);
        },
        mousemove: function (event) {
            var userPt = coords.mkPoint.fromXy(event.offsetX, event.offsetY);
            var clientX = Math.floor(userPt.x);
            var clientY = Math.floor(userPt.y);
            // console.log('event', event);
            var focalGraphCell = widget.clientPointToGraphCell(userPt);
            var cellContent = widget.getCellContent(focalGraphCell);
            widget.printToInfobar(0, "@client", " (" + clientX + ", " + clientY + ")");
            focalGraphCell.id = widget.getCellNum(focalGraphCell);
            widget.printToInfobar(1, '@dispcell', " (" + focalGraphCell.x + ", " + focalGraphCell.y + ") #" + focalGraphCell.id);
            widget.userGridLocation = {
                userPt: userPt,
                clientX: clientX, clientY: clientY,
                focalGraphCell: focalGraphCell,
                cellContent: cellContent
            };
            if (widget.hoverCell !== null) {
                if (focalGraphCell.id !== widget.hoverCell.id) {
                    widget.hoverCell = focalGraphCell;
                    widget.updateCellHoverHighlight(focalGraphCell);
                }
            }
            else {
                widget.hoverCell = focalGraphCell;
                widget.updateCellHoverHighlight(focalGraphCell);
            }
            if (cellContent) {
                var focalBox = GraphPaper.boundsToBox(LTBounds.FromInts(cellContent.region.bounds.left, cellContent.region.bounds.top, cellContent.region.bounds.width, cellContent.region.bounds.height));
                widget.userGridLocation.focalBox = focalBox;
                if (cellContent.region.isCells()) {
                    var row = cellContent.region.row;
                    var focalCellIndex = focalGraphCell.x - focalBox.origin.x;
                    var col = focalCellIndex;
                    widget.printToInfobar(3, '@gridcell', " (" + row + ", " + col + ")");
                }
                else {
                    widget.printToInfobar(3, '@gridcell', " --");
                }
                widget.showLabelHighlights(cellContent);
            }
            else {
                widget.clearLabelHighlights();
                widget.printToInfobar(3, '@gridcell', " --");
            }
        }
    };
    return handlers;
}
exports.updateUserPosition = updateUserPosition;
function labelingTool(widget) {
    return {
        mousedown: function ($event) {
            foldCellContent(widget.userGridLocation.cellContent, {
                onCells: function () {
                    var _a = widget.userGridLocation, focalGraphCell = _a.focalGraphCell, focalBox = _a.focalBox, cellContent = _a.cellContent;
                    var cellRow = cellContent.region.row;
                    var focalCellIndex = focalGraphCell.x - focalBox.origin.x;
                    var cellCol = focalCellIndex;
                    if ($event.shiftKey) {
                        maybeUpdateGrid(widget, widget.textGrid.slurp(cellRow));
                    }
                    else if ($event.ctrlKey) {
                        maybeUpdateGrid(widget, widget.textGrid.split(cellRow, cellCol));
                    }
                    else {
                        // Add a label to the clicked row of text
                        var focalClasses = TGI.gridRegions.labels(cellContent.region);
                        var focalLabel = _.last(focalClasses) || '';
                        var childLabels = TGI.labelSchemas.childLabelsFor(widget.labelSchema, focalLabel);
                        lbl.createLabelChoiceWidget(childLabels, widget.containerId)
                            .then(function (choice) {
                            var labelChoice = choice.selectedLabel;
                            widget.textGrid.labelRow(cellRow, Labels.forString(labelChoice));
                            widget.redrawAll();
                        }, function () { });
                    }
                },
                onLabelCover: function () {
                    // If user clicks on a leaf (right-most) label cover indicator, delete that label
                    var _a = widget.userGridLocation, focalBox = _a.focalBox, cellContent = _a.cellContent;
                    var focalLabels = TGI.gridRegions.labels(cellContent.region);
                    var boxRight = focalBox.shiftOrigin(2, 0);
                    var contentRight = widget.getBoxContent(boxRight);
                    var rightLabelCovers = _.filter(contentRight, function (c) { return c.region.isLabelCover(); });
                    var isLeafLabelCover = rightLabelCovers.length === 0;
                    if (isLeafLabelCover) {
                        var queryRight = boxRight.modifySpan(widget.colCount, 0);
                        var rightContents = widget.getBoxContent(queryRight);
                        var rightCells0 = _.filter(rightContents, function (c) { return c.region.isCells(); });
                        var rightCells = _.map(rightCells0, function (r) { return r.region; });
                        var region0 = _.head(rightCells);
                        widget.textGrid.unlabelNear(region0.row, 0, Labels.forString(focalLabels[0]));
                        widget.redrawAll();
                    }
                }
            });
        }
    };
}
exports.labelingTool = labelingTool;
function slicerTool(widget) {
    return {
        mousedown: function ($event) {
            foldCellContent(widget.userGridLocation.cellContent, {
                onCells: function () {
                    var _a = widget.userGridLocation, focalGraphCell = _a.focalGraphCell, focalBox = _a.focalBox, cellContent = _a.cellContent;
                    var cellRow = cellContent.region.row;
                    var focalCellIndex = focalGraphCell.x - focalBox.origin.x;
                    var cellCol = focalCellIndex;
                    if ($event.shiftKey) {
                        maybeUpdateGrid(widget, widget.textGrid.slurp(cellRow));
                    }
                    else {
                        maybeUpdateGrid(widget, widget.textGrid.split(cellRow, cellCol));
                    }
                }
            });
        }
    };
}
exports.slicerTool = slicerTool;
function doReorderDragDrop(widget) {
    var dragTextRow = widget.textReorderingState.dragSubjectTextRow;
    var dropTextRows = widget.textReorderingState.dropTargetsTextRows;
    var dragRegion = widget.cellRowToDisplayRegion[dragTextRow];
    widget.textReorderingState.dragRegion = dragRegion;
    // mouse cursor := closed hand
    return {
        mousedown: function () { },
        mousemove: function () {
            var _a = widget.userGridLocation, clientX = _a.clientX, clientY = _a.clientY;
            widget.d3$textgridSvg
                .select('.reorder-subject')
                .attr('x', clientX)
                .attr('y', clientY);
            foldCellContent(widget.userGridLocation.cellContent, {
                onCells: function () {
                    var cellContent = widget.userGridLocation.cellContent;
                    var focalTextRow = cellContent.region.row;
                    var hoveringDropTarget = _.some(dropTextRows, function (r) { return r === focalTextRow; });
                    if (hoveringDropTarget) {
                        widget.textReorderingState.currentDropRow = focalTextRow;
                        widget.d3$textgridSvg
                            .select('.reorder-subject')
                            .attr('opacity', 0.1);
                    }
                    else {
                        widget.textReorderingState.currentDropRow = undefined;
                        widget.d3$textgridSvg
                            .select('.reorder-subject')
                            .attr('opacity', 0.4);
                    }
                },
                elseRun: function () {
                    widget.textReorderingState.currentDropRow = undefined;
                    widget.d3$textgridSvg
                        .select('.reorder-subject')
                        .attr('opacity', 0.4);
                }
            });
        },
        mouseup: function () {
            // Either drop on legal point or cancel
            var dropRow = widget.textReorderingState.currentDropRow;
            if (dropRow !== undefined) {
                var newOrdering = _.flatMap(dropTextRows, function (r) {
                    if (r === dropRow) {
                        if (dragTextRow < dropRow) {
                            return [dropRow, dragTextRow];
                        }
                        else {
                            return [dragTextRow, dropRow];
                        }
                    }
                    else {
                        return [r];
                    }
                });
                var minRow = _.min(newOrdering);
                var maybeNewTextGrid = TGI.textGrids.reorderRows(widget.textGrid, minRow, newOrdering);
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
function moveLine(widget) {
    return {
        mousedown: function () {
            if (widget.textReorderingState !== undefined) {
                widget.setMouseHandlers([
                    updateUserPosition,
                    doReorderDragDrop
                ]);
            }
        },
        mousemove: function () {
            // Update drag object and drop point indicator
            foldCellContent(widget.userGridLocation.cellContent, {
                onCells: function () {
                    var _a = widget.userGridLocation, focalGraphCell = _a.focalGraphCell, focalBox = _a.focalBox, cellContent = _a.cellContent;
                    var cellRow = cellContent.region.row;
                    var focalCellIndex = focalGraphCell.x - focalBox.origin.x;
                    var cellCol = focalCellIndex;
                    // Determine legal drop points for this line
                    var possibleTextRows = TGI.textGrids.findLegalReorderingRows(widget.textGrid, cellRow, cellCol);
                    // console.log('possibleTextRows', possibleTextRows);
                    if (possibleTextRows.length > 1) {
                        // Legal reorderable textGrid rows
                        var dropTargetTextRows = _.filter(possibleTextRows, function (r) { return r !== cellRow; });
                        widget.textReorderingState = {
                            dragSubjectTextRow: cellRow,
                            dropTargetsTextRows: dropTargetTextRows
                        };
                    }
                    else {
                        widget.textReorderingState = undefined;
                    }
                    updateDropRegionIndicators(widget);
                },
                elseRun: function () {
                    widget.textReorderingState = undefined;
                    updateDropRegionIndicators(widget);
                }
            });
        },
        mouseup: function () {
            // Either drop on legal point or cancel
        }
    };
}
exports.moveLine = moveLine;
function updateDropRegionIndicators(widget) {
    widget.d3$textgridSvg
        .selectAll('.reorder-region')
        .remove();
    if (widget.textReorderingState !== undefined) {
        var dragTextRow = widget.textReorderingState.dragSubjectTextRow;
        var dropTextRows = widget.textReorderingState.dropTargetsTextRows;
        var dragRegion_1 = widget.cellRowToDisplayRegion[dragTextRow];
        var dropRegions = _.map(dropTextRows, function (textRow) {
            return widget.cellRowToDisplayRegion[textRow];
        });
        _.each(dropRegions, function (dropRegion) {
            widget.d3$textgridSvg
                .append('rect')
                .classed('reorder-region', true)
                .classed('reorder-drop', true)
                .call(d3x.initRect, function () { return dropRegion; })
                .call(d3x.initFill, 'blue', 0.3);
        });
        // Construct the 'grabbed' region
        widget.d3$textgridSvg
            .append('rect')
            .classed('reorder-region', true)
            .classed('reorder-subject', true)
            .call(d3x.initRect, function () { return dragRegion_1; })
            .call(d3x.initFill, 'green', 0.4);
    }
}
function foldCellContent(cellContent, _a) {
    var onLabelCover = _a.onLabelCover, onCells = _a.onCells, onLabelKey = _a.onLabelKey, onHeading = _a.onHeading, elseRun = _a.elseRun;
    var handlerRan = false;
    if (cellContent !== undefined) {
        if (cellContent.region.isLabelCover() && onLabelCover !== undefined) {
            handlerRan = true;
            onLabelCover();
        }
        else if (cellContent.region.isCells() && onCells !== undefined) {
            handlerRan = true;
            onCells();
        }
        else if (cellContent.region.isHeading() && onHeading !== undefined) {
            handlerRan = true;
            onHeading();
        }
        else if (cellContent.region.isLabelKey() && onLabelKey !== undefined) {
            handlerRan = true;
            onLabelKey();
        }
    }
    if (!handlerRan && elseRun !== undefined) {
        elseRun();
    }
}
function maybeUpdateGrid(widget, maybeGrid) {
    Options.fold(maybeGrid, function () { }, function (newGrid) {
        widget.textGrid = newGrid;
        widget.redrawAll();
    });
}
