/**
 *
 **/

/* global require */

export class DrawingApi {
    constructor (canvasId) {
        this.canvasId = canvasId;
        this.gridCanvas = document.getElementById(this.canvasId);
        this.context = this.gridCanvas.getContext('2d');
        this.context.font = this.textFont;
        this._textFont = '20px mono';
    }

    get textFont     () { return this._textFont; }
    get textHeight   () { return this._textHeight; }

    drawChar(cell, char) {
        this.context.fillStyle = 'black';
        this.context.fillText(char, cell.x*10, cell.y*10);

    }

    drawBox(box, border) {
        console.log('drawBox');
        this.context.rect(box.x, box.y, 20, 20);
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
// trait DrawingApi extends js.Object {
//     def drawChar(cell: GridCell, char: Char): Unit
//     def drawBox(box: Box, borderChars: BorderChars = BorderLineStyle.SingleWidth): Unit
//     def applyBgColor(x: Int, y: Int, color: Color): Unit
//     def applyColor(x: Int, y: Int, color: Color): Unit
//     def gradientHorizontal(box: Box): Unit
// }
