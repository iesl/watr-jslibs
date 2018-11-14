"use strict";
/**
 * Define and translate between the various coordinate systems used:
 *
 *
 *    PDF Media coords - (PDF-extracted page geometry and char bounding boxes)
 *    Single-Page Image coords - coords within the svg containing page image, scaled version of Media coords
 *    Screen event coords - e.g., where a user clicks on a page
 *    Client Pages View  - Absolute coords within the vertical scroll
 *                         list of page svgs/images (regardless of scroll position)
 *    Client Text View  - coords within the vertical scroll list of page text blocks  (regardless of scroll position)
 *
 *    event page/client/screen/offset explanations:
 *       https://stackoverflow.com/questions/6073505/what-is-the-difference-between-screenx-y-clientx-y-and-pagex-y
 */
exports.__esModule = true;
var CoordSys;
(function (CoordSys) {
    CoordSys[CoordSys["Unknown"] = 0] = "Unknown";
    CoordSys[CoordSys["Screen"] = 1] = "Screen";
    CoordSys[CoordSys["Div"] = 2] = "Div";
    CoordSys[CoordSys["GraphUnits"] = 3] = "GraphUnits";
    CoordSys[CoordSys["PdfMedia"] = 4] = "PdfMedia";
})(CoordSys = exports.CoordSys || (exports.CoordSys = {}));
var Point = /** @class */ (function () {
    function Point(x, y, sys) {
        this.x = x;
        this.y = y;
        this.sys = sys ? sys : CoordSys.Unknown;
        // this.type = "Point";
    }
    Point.prototype.svgShape = function () {
        return {
            type: "circle",
            r: 3,
            cx: this.x,
            cy: this.y
        };
    };
    return Point;
}());
var Line = /** @class */ (function () {
    function Line(p1, p2) {
        this.sys = CoordSys.Unknown;
        this.p1 = p1;
        this.p2 = p2;
    }
    Line.prototype.svgShape = function () {
        return {
            type: "line",
            x1: this.p1.x,
            x2: this.p2.x,
            y1: this.p1.y,
            y2: this.p2.y
        };
    };
    return Line;
}());
var Trapezoid = /** @class */ (function () {
    function Trapezoid(top, bottom) {
        this.topLine = top;
        this.bottomLine = bottom;
    }
    Trapezoid.prototype.svgShape = function () {
        var p1 = this.topLine.p1;
        var p2 = this.topLine.p2;
        var p3 = this.bottomLine.p2;
        var p4 = this.bottomLine.p1;
        return {
            type: "path",
            d: "M " + p1.x + " " + p1.y + " L " + p2.x + " " + p2.y + " L " + p3.x + " " + p3.y + " L " + p4.x + " " + p4.y + " Z"
        };
    };
    return Trapezoid;
}());
exports.mkPoint = {
    fromXy: function (x, y, sys) {
        return new Point(x, y, sys);
    },
    fromD3Mouse: function (d3Mouse) {
        return new Point(d3Mouse[0], d3Mouse[1], CoordSys.Screen);
    },
    offsetFromJqEvent: function (event) {
        return exports.mkPoint.fromXy(event.offsetX, event.offsetY, CoordSys.Screen);
    },
    fromFloatReps: function (o) {
        return new Point(o.x / 100.0, o.y / 100.0, CoordSys.PdfMedia);
    }
};
function pointFloor(p) {
    return exports.mkPoint.fromXy(Math.floor(p.x), Math.floor(p.y), p.sys);
}
exports.pointFloor = pointFloor;
/**
 *  General purpose bounding box data that meets the interface requirements
 *  for the various libraries in use
 */
var BBox = /** @class */ (function () {
    // public bottom: number;
    // public minX: number;
    // public minY: number;
    // public maxX: number;
    // public maxY: number;
    function BBox(l, t, w, h, sys) {
        this.left = l;
        this.top = t;
        this.width = w;
        this.height = h;
        this.sys = sys ? sys : CoordSys.Unknown;
    }
    Object.defineProperty(BBox.prototype, "minX", {
        get: function () { return this.left; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BBox.prototype, "minY", {
        get: function () { return this.top; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BBox.prototype, "maxX", {
        get: function () { return this.left + this.width; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BBox.prototype, "maxY", {
        get: function () { return this.top + this.height; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BBox.prototype, "x", {
        get: function () { return this.left; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BBox.prototype, "y", {
        get: function () { return this.top; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BBox.prototype, "x1", {
        get: function () { return this.left; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BBox.prototype, "x2", {
        get: function () { return this.left + this.width; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BBox.prototype, "y1", {
        get: function () { return this.top; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BBox.prototype, "y2", {
        get: function () { return this.top + this.height; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BBox.prototype, "bottom", {
        get: function () { return this.top + this.height; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BBox.prototype, "right", {
        get: function () { return this.left + this.width; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BBox.prototype, "topLeft", {
        get: function () { return exports.mkPoint.fromXy(this.left, this.top, this.sys); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BBox.prototype, "intRep", {
        // set system(s)  { this._system = s; }
        // get system()   { return this._system; }
        get: function () {
            return [
                Math.trunc(this.left * 100.0),
                Math.trunc(this.top * 100.0),
                Math.trunc(this.width * 100.0),
                Math.trunc(this.height * 100.0)
            ];
        },
        enumerable: true,
        configurable: true
    });
    BBox.prototype.toString = function () {
        return "BBox(" + this.left + ", " + this.top + ", " + this.width + ", " + this.height + ")";
    };
    BBox.prototype.svgShape = function () {
        return {
            type: "rect",
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    };
    return BBox;
}());
exports.BBox = BBox;
exports.mk = {
    fromLtwhFloatReps: function (o) {
        return new BBox(o.left / 100.0, o.top / 100.0, o.width / 100.0, o.height / 100.0, CoordSys.Unknown);
    },
    fromLtwh: function (l, t, w, h) {
        return new BBox(l, t, w, h, CoordSys.Unknown);
    },
    fromLtwhObj: function (o) {
        return new BBox(o.left, o.top, o.width, o.height, CoordSys.Unknown);
    },
    fromArray: function (ltwh) {
        var left = ltwh[0] / 100.0;
        var top = ltwh[1] / 100.0;
        var width = ltwh[2] / 100.0;
        var height = ltwh[3] / 100.0;
        return new BBox(left, top, width, height, CoordSys.PdfMedia);
    }
};
function boxCenteredAt(p, width, height) {
    var left = p.x - (width / 2);
    var top = p.y - (height / 2);
    return exports.mk.fromLtwh(left, top, width, height);
}
exports.boxCenteredAt = boxCenteredAt;
function fromFigure(fig) {
    var shape;
    if (fig.LTBounds) {
        shape = exports.mk.fromArray(fig.LTBounds);
    }
    else if (fig.Line) {
        var p1 = exports.mkPoint.fromFloatReps(fig.Line.p1);
        var p2 = exports.mkPoint.fromFloatReps(fig.Line.p2);
        shape = new Line(p1, p2);
    }
    else if (fig.Point) {
        shape = exports.mkPoint.fromFloatReps(fig.Point);
    }
    else if (fig.Trapezoid) {
        var topP1 = exports.mkPoint.fromFloatReps(fig.Trapezoid.topLeft);
        var topP2 = exports.mkPoint.fromFloatReps({
            x: fig.Trapezoid.topLeft.x + fig.Trapezoid.topWidth,
            y: fig.Trapezoid.topLeft.y
        });
        var bottomP1 = exports.mkPoint.fromFloatReps(fig.Trapezoid.bottomLeft);
        var bottomP2 = exports.mkPoint.fromFloatReps({
            x: fig.Trapezoid.bottomLeft.x + fig.Trapezoid.bottomWidth,
            y: fig.Trapezoid.bottomLeft.y
        });
        var top_1 = new Line(topP1, topP2);
        var bottom = new Line(bottomP1, bottomP2);
        shape = new Trapezoid(top_1, bottom);
    }
    else {
        throw new Error("could not construct shape from figure " + fig);
    }
    return shape;
}
exports.fromFigure = fromFigure;
