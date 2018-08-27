
/**
 * Helper functions and classes to construct shapes that conform to a 'graph paper' setup,
 * e.g., rows and columns of equally sized cells, addressable by (row, col) coords.
 *
 * This makes it easy to construct a bounding box that exactly covers a paricular cell or
 * rectangular box of cells. One is provided to create SVG shapes, another to create
 * Html Canvas shapes.
 *
 **/

/* global require _ fabric */

/**
 *
 *  |------------+--------------+-------------+-----------+-------------+-------------|
 *  | font-style | font-variant | font-weight | font-size | line-height | font-family |
 *  |------------+--------------+-------------+-----------+-------------+-------------|
 *  |            | small-caps   | normal      | px        |             |             |
 *  | italic     |              | bold        |           |             |             |
 *  | normal     |              | lighter     |           |             |             |
 *  | oblique    |              | bolder      |           |             |             |
 *  |            |              | 100-900     |           |             |             |
 *  |------------+--------------+-------------+-----------+-------------+-------------|
 *
 **/
import * as coords from './coord-sys';
import * as colors from './colors';


/**
 * Set of functions to  convert between cell-based and cartesian geometries
 */
export class GraphPaper  {
    constructor (rowCount, colCount, cellWidth, cellHeight) {
        this.rowCount = rowCount;
        this.colCount= colCount;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
    }


    cellAt(x, y) {
        return new GraphCell(x, y, this);
    }

    boxAt(x, y, spanRight, spanDown) {
        return new GraphBox(this.cellAt(x, y), spanRight, spanDown, this);
    }
}

class GraphCell  {
    constructor (x, y, graphPaper) {
        this.x = x;
        this.y = y;
        this.graphPaper = graphPaper;
    }

    getBounds() {
        let gp = this.graphPaper;
        return new coords.BBox(
            this.x*gp.cellWidth,
            this.y*gp.cellHeight,
            gp.cellWidth,
            gp.cellHeight
        );
    }
}

class GraphBox  {
    constructor (originCell, spanRight, spanDown, graphPaper) {
        this.originCell = originCell;
        this.spanRight = spanRight;
        this.spanDown = spanDown;
        this.graphPaper = graphPaper;

        this.bounds = new coords.BBox(
            this.originCell.x*graphPaper.cellWidth,
            this.originCell.y*graphPaper.cellHeight,
            (this.spanRight-1)*graphPaper.cellWidth,
            (this.spanDown-1)*graphPaper.cellHeight
        );
    }

}

export class FabricJsGraphPaper  {
    constructor (canvasId, fontSize) {
        this.canvasId = canvasId;
        this.gridCanvas = document.getElementById(this.canvasId);
        this.fontSize = fontSize;
        this.fabricCanvas = new fabric.StaticCanvas(canvasId, {
            renderOnAddRemove: false
        });
        this.fontProps = {
            style: 'normal',
            weight: 'normal',
            size: '20'
        };
        let fontFace = this.makeFontFace({size: fontSize});
        let context = this.fabricCanvas.getContext();
        context.font = fontFace;
        this._cellWidth = context.measureText('A').width;
        this._cellHeight = this.fontSize+4;
        // console.log('cellWidth', this.cellWidth);
        // console.log('cellHeight', this.cellHeight);
    }
    setDimensions(w, h, cols, rows) {
        this.rowCount = rows;
        this.colCount = cols;
        this.fabricCanvas.setDimensions({width: w, height: h});
        this.fabricCanvas.setDimensions({width: `${w}px`, height: `${h}px`}, {cssOnly: true});

    }

    initContext() {
        // let context = this.gridCanvas.getContext('2d');
        // context.font = this.fontFace;
        // Object.assign(context, this.contextProps);
        // return context;
        return this.fabricCanvas.getContext();
    }
    makeFontFace() {
        let p = this.fontProps;
        return `${p.style} normal ${p.weight} ${p.size}px Courier New`;
    }

    set contextProp(p) {
        // Object.assign(this.contextProps, p);
    }

    set alpha(w) {
        // this.contextProps.globalAlpha = w;
    }

    set fontWeight(w) {
        this.fontProps.weight = w;
        this.makeFontFace();
    }
    set fontStyle(w) {
        this.fontProps.style = w;
        this.makeFontFace();
    }

    get textFont     () { return this._textFont; }
    get textHeight   () { return this._textHeight; }
    get cellWidth    () { return this._cellWidth; }
    get cellHeight   () { return this._cellHeight; }

    get context2d    () {
        return this.fabricCanvas.getContext();
        // return this.context;
        // return this.initContext();
    }

    cellToBounds(cell) {
        let x = cell.x * this.cellWidth;
        let y = cell.y * this.cellHeight;
        let w = this.cellWidth;
        let h = this.cellHeight;
        return coords.mk.fromLtwh(x, y, w, h);
    }

    boxToBounds(box) {
        let bb = box.toLTBounds();
        let x = bb.left*this.cellWidth;
        let y = bb.top* this.cellHeight;
        let w = bb.width * this.cellWidth;
        let h = bb.height * this.cellHeight;
        return coords.mk.fromLtwh(x, y, w, h);
    }

    drawString(box, str) {
        let {left, top, width, height} = this.cellToBounds(box.origin);
        let text = new fabric.Text(str, {
            objectCaching: false,
            left: left, top: top,
            fontSize: 20,
            fontStyle: 'normal',
            fontFamily: 'Courier New'
        });
        this.fabricCanvas.add(text);
    }

    drawChar(cell, char) {
        let {left, top, width, height} = this.cellToBounds(cell);
        // this.context2d.fillStyle = 'black';
        // this.context2d.fillText(char, left, top+height);
        let text = new fabric.Text(char, {
            objectCaching: false,
            left: left, top: top,
            fontSize: 20,
            fontStyle: 'normal',
            fontFamily: 'Courier New'
        });
        this.fabricCanvas.add(text);
    }

    drawBox(box, border) {
        // let {left, top, width, height} = this.boxToBounds(box);
        let bounds = this.boxToBounds(box);

        var rect = new fabric.Rect(bounds);
        this.fabricCanvas.add(rect);
        // this.context2d.rect(left, top, width, height);
        // this.context2d.stroke();
    }

    fillBox(box, modCtx) {
        let bounds = this.boxToBounds(box);
        var rect = new fabric.Rect(bounds, {
            objectCaching: false
        });
        modCtx(rect);

        this.fabricCanvas.add(rect);
    }


    applyCanvasStripes() {
        let rowWidth = this.cellWidth * (this.colCount+8);
        _.each(_.range(this.rowCount+10), row => {
            let rtop = row * this.cellHeight;
            let h = this.cellHeight;
            var rect = new fabric.Rect({
                left: 0,
                top: rtop,
                width: rowWidth,
                height: h
            });
            rect.setGradient('fill', {
                x1: 0,
                y1: 0,
                x2: 0, y2: h,
                colorStops: {
                    0 : colors.Color.GhostWhite,
                    0.9: colors.Color.Linen,
                    1: colors.Color.Cornsilk
                }
            });

            this.fabricCanvas.add(rect);
        });
    }
}

export class NativeCanvasGraphPaper {
    constructor (canvasId, fontSize) {
        this.canvasId = canvasId;
        this.gridCanvas = document.getElementById(this.canvasId);
        this.fontSize = fontSize;
        this.fabricCanvas = new fabric.StaticCanvas(canvasId, {
            renderOnAddRemove: false
        });
        this.fontProps = {
            style: 'normal',
            weight: 'normal',
            size: '20'
        };
        let fontFace = this.makeFontFace({size: fontSize});
        let context = this.fabricCanvas.getContext();
        context.font = fontFace;
        this._cellWidth = context.measureText('A').width;
        this._cellHeight = this.fontSize+4;
    }

}
