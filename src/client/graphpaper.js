/**
 *
 **/

/* global require */

import * as coords from './coord-sys.js';

export class DrawingApi {
    constructor (canvasId, fontSize) {
        this.canvasId = canvasId;
        this.gridCanvas = document.getElementById(this.canvasId);
        this.context = this.gridCanvas.getContext('2d');
        this._textFont = `${fontSize}px mono`;
        this.context.font = this.textFont;
        this.cellWidth = this.context.measureText('A').width;
        this.cellHeight = fontSize+4;
        this.context.textBaseline="bottom";

    }

    get textFont     () { return this._textFont; }
    get textHeight   () { return this._textHeight; }

    cellToBounds(cell) {
        let x = cell.x   * this.cellWidth;
        let y = cell.y * this.cellHeight;
        let w = this.cellWidth;
        let h = this.cellHeight;
        return coords.mk.fromLtwh(x, y, w, h);
    }

    boxToBounds(box) {
        let bb = box.toLTBounds();
        let x = bb.getLeft()*this.cellWidth;
        let y = bb.getTop()* this.cellHeight;
        let w = bb.getWidth() * this.cellWidth;
        let h = bb.getHeight()* this.cellHeight;
        return coords.mk.fromLtwh(x, y, w, h);
    }

    drawChar(cell, char) {
        let {left, top, width, height} = this.cellToBounds(cell);
        this.context.fillStyle = 'black';
        this.context.fillText(char, left, top+height);

    }

    drawBox(box, border) {
        let {left, top, width, height} = this.boxToBounds(box);
        this.context.rect(left, top, width, height);
        this.context.stroke();
    }

    applyBgColor(x, y, color) {
        console.log('applyBgColor');
    }

    applyColor(x, y, color) {
        console.log('applyColor');

    }
    gradientHorizontal(box) {
        console.log('gradientHorizontal');
    }
}
