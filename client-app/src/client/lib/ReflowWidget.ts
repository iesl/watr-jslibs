/**
 *
 **/

/* global require fabric */

import * as $ from 'jquery';
import * as _ from 'lodash';
import * as fabric from 'fabric';
import * as d3 from 'd3';

import * as mhs from './MouseHandlerSets';

import * as coords from './coord-sys';
import { $id, t, htm } from "./tstags";
import {shared} from './shared-state';

import * as d3x from './d3-extras';

import * as gp from './graphpaper-variants';
import * as colors from './colors';

import { JsArray } from 'watr.utils';

// const TGI = watr.textgrid.TextGridInterop;
import TGI from 'watr.textgrid.TextGridInterop';

import * as reflowTools from './ReflowTools';

import Infobar from './Infobar';
import { ServerDataExchange } from './ServerDataExchange';

export function unshowGrid() {
  if (shared.activeReflowWidget !== undefined) {
    const widget = shared.activeReflowWidget;
    $id(widget.containerId).empty();
    shared.activeReflowWidget = undefined;
  }
}


export class ReflowWidget {
  containerId: string;
  gridNum: number;
  textGrid: TextGrid;
  textHeight: number;
  labelSchema: LabelSchema;
  frameId: string;
  canvasId: string;
  svgId: string;
  zoneId: string;
  zoneLabel: string;
  infoBar: Infobar;
  serverExchange: ServerDataExchange;
  rowCount?: number;
  colCount?: number;
  cellHeight?: number;
  cellWidth?: number;


  /**
   * @param {ServerDataExchange}  serverExchange
   */
  constructor (containerId: string, textGrid: TextGrid, labelSchema: LabelSchema, zoneId: string, zoneLabel: string, serverExchange: ServerDataExchange) {

    const gridNum = 1000;
    this.containerId = containerId;
    this.gridNum = gridNum;
    this.textGrid = textGrid; // .trimRights().padRights();
    this.textHeight = 20;
    this.labelSchema = labelSchema;

    this.frameId  = `textgrid-frame-${gridNum}`;
    this.canvasId = `textgrid-canvas-${gridNum}`;
    this.svgId    = `textgrid-svg-${gridNum}`;
    this.zoneId = zoneId;
    this.zoneLabel = zoneLabel;
    this.infoBar = new Infobar(this.containerId, 2, 3);
    this.serverExchange = serverExchange;

  }



  setupTopStatusBar() {
    const self = this;
    const setTool = h => {
      return function () {
        return self.setMouseHandlers([reflowTools.updateUserPosition, h]);
      };
    };

    const controls = [
      [ 'labeler'    , 'pencil'             , true,  'Labeling tool'        , setTool( reflowTools.labelingTool )  ],
      [ 'slicer'     , 'scissors'           , false, 'Text slicing'         , setTool( reflowTools.slicerTool   )  ],
      [ 'move'       , 'arrows-v'           , false, 'Move line up or down' , setTool( reflowTools.moveLine     )  ]
    ];

    const leftControls = htm.makeRadios('shapers', controls);

    const infoToggle = this.infoBar.getToggle();

    const closeButton = t.span(
      '.spacedout',
      htm.iconButton('close')
    );

    const rightControls = t.span(
      '.pull-right .spacedout',
      infoToggle, closeButton
    );
    // unshowWidget
    $(`#${this.containerId} .status-top`)
      .append(leftControls)
      .append(rightControls);
  }

  init () {

    return new Promise((resolve) => {
      const initWidth = 400;
      const gridHeight = 300; // this.gridBounds.bottom;

      /**
       * Structure:
       *    div.gridwidget
       *        div.status-top
       *        div.left-gutter
       *        div.infobar
       *        div.frame
       *            canvas.textgrid
       *            svg.textgrid
       *        div.right-gutter
       *        div.status-bottom
       */

      const gridNodes =
          t.div(`.textgrid #${this.frameId}`, {style: `width: ${initWidth}px; height: ${gridHeight}px;`}, [
            t.canvas(`.textgrid #${this.canvasId}`, {page: this.gridNum, width: initWidth, height: gridHeight})
          ]) ;

      const infobarElem = this.infoBar.getElem();

      const widgetNode =
          t.div(`.gridwidget`, [
            t.div(`.status-top`),
            t.div(`.left-gutter`),
            infobarElem,
            t.div(`.gridcontent`, [
              gridNodes
            ]),
            t.div(`.right-gutter`),
            t.div(`.status-bottom`)
          ]);

      $id(this.containerId).append(widgetNode);

      // Setup status bar
      this.setupTopStatusBar();

      this.d3$textgridSvg = d3.select('#'+this.frameId)
        .append('svg').classed('textgrid', true)
        .datum(this.textGrid.gridData)
        .attr('id', `${this.svgId}`)
        .attr('page', this.gridNum)
        .attr('width', initWidth)
        .attr('height', gridHeight)
        .call(() => resolve())
      ;

    }).then(() => {
      this.setMouseHandlers([
        reflowTools.updateUserPosition,
        reflowTools.labelingTool
      ]);

      return this.redrawAll();
    });

  }

  printToInfobar(slot: number, label: string, value: any) {
    this.infoBar.printToInfobar(slot, label, value);
  }

  updateDomNodeDimensions() {
    return new Promise((resolve) => {
      const height = this.rowCount * this.cellHeight;
      const width = this.colCount * this.cellWidth;

      $id(this.frameId).width(width).height(height);

      this.drawingApi.setDimensions(width, height, this.colCount, this.rowCount);

      this.d3$textgridSvg
        .attr('width', width)
        .attr('height', height)
        .call(() => resolve())
      ;
    });
  }

  saveTextGrid() {
    shared.activeReflowWidget = this;
    const gridAsJson = JSON.parse(this.textGrid.toJson().toString());

    if (! shared.DEV_MODE) {
      this.serverExchange.setAnnotationText(this.zoneId, gridAsJson);
    }
  }

  makeRTreeBox(region) {
    const {left, top, width, height} = region.bounds;
    const box = new coords.BBox(
      left*4, top*4, width*4, height*4
    );
    box.region = region;
    return box;
  }


  drawGridShapes() {
    const gridProps = this.gridProps;

    this.cellRowToDisplayRegion = {};

    this.drawingApi.applyCanvasStripes();

    const gridRegions = TGI.widgetDisplayGridProps.gridRegions(gridProps);
    const allClasses = TGI.labelSchemas.allLabels(this.labelSchema);
    const colorMap = _.zipObject(allClasses, colors.HighContrast);

    const rtreeBoxes = _.map(gridRegions, region => {
      const classes = TGI.gridRegions.labels(region);
      const cls = classes[classes.length-1];
      const box = region.gridBox;
      const bounds = region.bounds;
      const {left, top, height} = this.scaleLTBounds(bounds);
      if (region.isLabelKey()) {
        const label = region.labelIdent;
        const text = new fabric.Text(label, {
          left, top,
          objectCaching: false,
          fontSize: this.textHeight,
          fontStyle: 'normal',
          fontFamily: 'Courier New',
          fontWeight: 'bold',
          textBackgroundColor: new fabric.Color(colorMap[cls]).setAlpha(0.5).toRgba()
        });
        this.drawingApi.fabricCanvas.add(text);


      } else if (region.isCells()) {
        const cells = JsArray.fromScala(region.cells);
        // Create a mapping between textgrid rows and displaygrid rows
        const cellRow = region.row;
        this.cellRowToDisplayRegion[cellRow] = this.scaleLTBounds(bounds);

        const cellChrs = _.map(cells, c => c.char.toString());
        if (cellChrs[0] === ' ') {
          cellChrs[0] = '░';
        }
        if (cellChrs[cellChrs.length-1] === ' ') {
          cellChrs[cellChrs.length-1] = '░';
        }
        const cellStr = cellChrs.join('');

        const text = new fabric.Text(cellStr, {
          left, top,
          objectCaching: false,
          fontSize: this.textHeight,
          fontStyle: 'normal',
          fontFamily: 'Courier New'
          // fontWeight: 'bold',
          // textBackgroundColor: new fabric.Color(colorMap[cls]).setAlpha(0.5).toRgba()
        });
        this.drawingApi.fabricCanvas.add(text);

      } else if (region.isLabelCover()) {

        this.drawingApi.fillBox(box, (rect) => {
          rect.setGradient('fill', {
            x1: 0, y1: 0,
            x2: 0, y2: height,
            colorStops: {
              0:  new fabric.Color('rgb(255, 255, 255').setAlpha(0).toRgba(),
              0.6:  new fabric.Color('rgb(255, 255, 255').setAlpha(0.1).toRgba(),
              1:  new fabric.Color(colorMap[cls]).setAlpha(0.8).toRgba()
            }
          });
        });

        this.drawingApi.fillBox(box, (rect) => {
          rect.setGradient('fill', {
            x1: 0, y1: 0,
            x2: 0, y2: height,
            colorStops: {
              0:  new fabric.Color(colorMap[cls]).setAlpha(0.8).toRgba(),
              0.2: new fabric.Color('rgb(255, 255, 255').setAlpha(0).toRgba()
            }
          });
        });

        const abbrev = TGI.labelSchemas.abbrevFor(this.labelSchema, cls);
        const text = new fabric.Text(abbrev, {
          left, top,
          objectCaching: false,
          fontSize: this.textHeight,
          fontStyle: 'normal',
          fontFamily: 'Courier New',
          fontWeight: 'bolder',
          fill: 'black',
          // textBackgroundColor: new fabric.Color(colorMap[cls]).toRgb(),
          underline: true
          // linethrough: '',
          // overline: ''
        });

        this.drawingApi.fabricCanvas.add(text);

      } else if (region.isHeading()) {
        const text = new fabric.Text(region.heading, {
          left, top,
          objectCaching: false,
          fontSize: this.textHeight,
          fontStyle: 'italic',
          fontFamily: 'Courier New',
          fontWeight: 'bolder',
          textBackgroundColor: new fabric.Color(colorMap[cls]).setAlpha(0.2).toRgba()
          // underline: '',
          // linethrough: '',
          // overline: ''
        });
        this.drawingApi.fabricCanvas.add(text);
      }
      return this.makeRTreeBox(region);
    });

    this.drawingApi.fabricCanvas.renderAll();

    this.reflowRTree = rtree();

    this.reflowRTree.load(rtreeBoxes);

    this.d3$textgridSvg
      .selectAll(`rect`)
      .remove();

    _.each(this.reflowRTree.all(), data => {

      const region = data.region;
      const bounds = region.bounds;
      const scaled = this.scaleLTBounds(bounds);
      const classes = TGI.gridRegions.labels(region);

      const regionType;
      if (region.isLabelKey()) {
        regionType = 'LabelKey';
      } else if (region.isCells()) {
        regionType = 'Cell';
      } else if (region.isLabelCover()) {
        regionType = 'LabelCover';
      } else if (region.isHeading()) {
        regionType = 'Heading';
      }
      const cls = classes[classes.length-1];

      this.d3$textgridSvg
        .append('rect')
        .classed(`${regionType}`, true)
        .classed(`${cls}`, true)
        .call(d3x.initRect, () => scaled)
        .call(d3x.initFill, 'yellow', 0.0)
      ;
    });

  }

  redrawAll() {
    this.gridProps = TGI.textGrids.textGridToWidgetGrid(this.textGrid, this.labelSchema, 2, 2);
    const rowCount = Math.max(this.gridProps.getGridRowCount(), 40);
    const colCount = Math.max(this.gridProps.getGridColCount(), 100);


    this.rowCount = rowCount;
    this.colCount = colCount;
    const drawingApi = new gp.FabricJsGraphPaper(this.canvasId, this.textHeight);

    this.cellWidth = drawingApi.cellWidth;
    this.cellHeight = drawingApi.cellHeight;
    this.drawingApi = drawingApi;


    return this.updateDomNodeDimensions()
      .then(() => this.drawGridShapes())
      .then(() => this.saveTextGrid());

  }

  graphCellToClientBounds(graphCell) {
    // Construct a query box that aligns with grid
    const cellLeft = graphCell.x * this.cellWidth;
    const cellTop = graphCell.y * this.cellHeight;
    return coords.mk.fromLtwh(cellLeft, cellTop, this.cellWidth, this.cellHeight);
  }


  clientPointToGraphCell(clientPt) {
    const cellCol = Math.floor(clientPt.x / this.cellWidth);
    const cellRow = Math.floor(clientPt.y / this.cellHeight);
    return coords.mkPoint.fromXy(cellCol, cellRow);
  }

  scaleLTBounds(bb) {
    const x = bb.left*this.cellWidth;
    const y = bb.top* this.cellHeight;
    const w = bb.width * this.cellWidth;
    const h = bb.height* this.cellHeight;
    return coords.mk.fromLtwh(x, y, w, h);
  }

  getCellContent(graphCell) {
    const reflowRTree = this.reflowRTree;
    // RTree cells are 4x4 for indexing purposes, this query is centered within the cell (not touching the edges)
    const rtreeQuery = coords.mk.fromLtwh(graphCell.x*4+1, graphCell.y*4+1, 1, 1);
    const cellContent = reflowRTree.search(rtreeQuery);
    if (cellContent.length > 1) {
      console.error("more than one thing found at grid cell ", graphCell);
    }
    return cellContent[0];
  }

  getBoxContent(cellBox) {
    return this.reflowRTree.search(
      coords.mk.fromLtwh(
        cellBox.left*4+1, cellBox.top*4+1,
        ((cellBox.spanRight+1)*4)-2,
        ((cellBox.spanDown+1)*4)-2
      )
    );
  }

  getCellNum(graphCell) {
    return graphCell.y * this.colCount + graphCell.x;
  }

  setMouseHandlers(handlers) {
    mhs.setMouseHandlers(this, this.frameId, handlers);
  }

  updateCellHoverHighlight(hoverGraphCell) {
    this.d3$textgridSvg
      .selectAll('.cell-focus')
      .remove() ;

    this.d3$textgridSvg
      .append('rect')
      .classed('cell-focus', true)
      .call(d3x.initRect, () => this.graphCellToClientBounds(hoverGraphCell))
      .call(d3x.initStroke, 'blue', 1, 0.4)
      .call(d3x.initFill, 'yellow', 0.4)
    ;
  }

  clearLabelHighlights() {
    _.each(['LabelCover', 'Heading', 'Cell', 'LabelKey'], cls => {
      this.d3$textgridSvg
        .selectAll(`rect.${cls}`)
        .attr('fill-opacity', 0)
      ;
    });
  }

  showLabelHighlights(cell) {
    const classes = TGI.gridRegions.labels(cell.region);
    const cls = classes[classes.length-1];
    // console.log('hovering', classes);

    if (cell.region.isLabelCover() || cell.region.isHeading()) {
      this.clearLabelHighlights();
      this.d3$textgridSvg
        .selectAll(`rect.${cls}`)
        .attr('fill-opacity', 0.5)
      ;
    }
    else if (cell.region.isLabelKey()) {
      this.clearLabelHighlights();
      this.d3$textgridSvg
        .selectAll(`rect.${cls}`)
        .attr('fill-opacity', 0.5)
      ;
    }

  }
}
