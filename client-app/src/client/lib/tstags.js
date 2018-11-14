"use strict";
/**
 * Some helper functions for working with client-side html
 */
exports.__esModule = true;
var _ = require("lodash");
// import * as $ from "jquery";
var jquery_1 = require("jquery");
var LodashPlus_1 = require("./LodashPlus");
function $id(selector) {
    return jquery_1["default"]("#" + selector);
}
exports.$id = $id;
function mkNbsp(n) {
    var nx = n || 1;
    var nbsps = _.times(nx, _.constant("\u00A0"));
    return document.createTextNode(_.join(nbsps, ""));
}
exports.mkNbsp = mkNbsp;
var JQNodeCtors = /** @class */ (function () {
    function JQNodeCtors() {
        this.nbsp = mkNbsp;
        /* tslint:disable: member-access */
        this.a = nodeCtr("a");
        this.abbr = nodeCtr("abbr");
        this.acronym = nodeCtr("acronym");
        this.address = nodeCtr("address");
        this.applet = nodeCtr("applet");
        this.area = nodeCtr("area");
        this.article = nodeCtr("article");
        this.aside = nodeCtr("aside");
        this.audio = nodeCtr("audio");
        this.b = nodeCtr("b");
        this.base = nodeCtr("base");
        this.basefont = nodeCtr("basefont");
        this.bdi = nodeCtr("bdi");
        this.bdo = nodeCtr("bdo");
        this.big = nodeCtr("big");
        this.blockquote = nodeCtr("blockquote");
        this.body = nodeCtr("body");
        this.br = nodeCtr("br");
        this.button = nodeCtr("button");
        this.canvas = nodeCtr("canvas");
        this.caption = nodeCtr("caption");
        this.center = nodeCtr("center");
        this.cite = nodeCtr("cite");
        this.code = nodeCtr("code");
        this.col = nodeCtr("col");
        this.colgroup = nodeCtr("colgroup");
        this.data = nodeCtr("data");
        this.datalist = nodeCtr("datalist");
        this.dd = nodeCtr("dd");
        this.del = nodeCtr("del");
        this.details = nodeCtr("details");
        this.dfn = nodeCtr("dfn");
        this.dialog = nodeCtr("dialog");
        this.dir = nodeCtr("dir");
        this.div = nodeCtr("div");
        this.dl = nodeCtr("dl");
        this.dt = nodeCtr("dt");
        this.em = nodeCtr("em");
        this.embed = nodeCtr("embed");
        this.fieldset = nodeCtr("fieldset");
        this.figcaption = nodeCtr("figcaption");
        this.figure = nodeCtr("figure");
        this.font = nodeCtr("font");
        this.footer = nodeCtr("footer");
        this.form = nodeCtr("form");
        this.frame = nodeCtr("frame");
        this.frameset = nodeCtr("frameset");
        this.h1 = nodeCtr("h1");
        this.h2 = nodeCtr("h2");
        this.h3 = nodeCtr("h3");
        this.h4 = nodeCtr("h4");
        this.h5 = nodeCtr("h5");
        this.h6 = nodeCtr("h6");
        this.head = nodeCtr("head");
        this.header = nodeCtr("header");
        this.hr = nodeCtr("hr");
        this.html = nodeCtr("html");
        this.i = nodeCtr("i");
        this.iframe = nodeCtr("iframe");
        this.img = nodeCtr("img");
        this.input = nodeCtr("input");
        this.ins = nodeCtr("ins");
        this.kbd = nodeCtr("kbd");
        this.label = nodeCtr("label");
        this.legend = nodeCtr("legend");
        this.li = nodeCtr("li");
        this.link = nodeCtr("link");
        this.main = nodeCtr("main");
        this.map = nodeCtr("map");
        this.mark = nodeCtr("mark");
        this.menu = nodeCtr("menu");
        this.menuitem = nodeCtr("menuitem");
        this.meta = nodeCtr("meta");
        this.meter = nodeCtr("meter");
        this.nav = nodeCtr("nav");
        this.noframes = nodeCtr("noframes");
        this.noscript = nodeCtr("noscript");
        // object  = nodeCtr("// object");
        this.ol = nodeCtr("ol");
        this.optgroup = nodeCtr("optgroup");
        this.option = nodeCtr("option");
        this.output = nodeCtr("output");
        this.p = nodeCtr("p");
        this.param = nodeCtr("param");
        this.picture = nodeCtr("picture");
        this.pre = nodeCtr("pre");
        this.progress = nodeCtr("progress");
        this.q = nodeCtr("q");
        this.rp = nodeCtr("rp");
        this.rt = nodeCtr("rt");
        this.ruby = nodeCtr("ruby");
        this.s = nodeCtr("s");
        this.samp = nodeCtr("samp");
        this.script = nodeCtr("script");
        this.section = nodeCtr("section");
        this.select = nodeCtr("select");
        this.small = nodeCtr("small");
        this.source = nodeCtr("source");
        this.span = nodeCtr("span");
        this.strike = nodeCtr("strike");
        this.strong = nodeCtr("strong");
        this.style = nodeCtr("style");
        this.sub = nodeCtr("sub");
        this.summary = nodeCtr("summary");
        this.sup = nodeCtr("sup");
        this.table = nodeCtr("table");
        this.tbody = nodeCtr("tbody");
        this.td = nodeCtr("td");
        this.textarea = nodeCtr("textarea");
        this.tfoot = nodeCtr("tfoot");
        this.th = nodeCtr("th");
        this.thead = nodeCtr("thead");
        this.time = nodeCtr("time");
        this.title = nodeCtr("title");
        this.tr = nodeCtr("tr");
        this.track = nodeCtr("track");
        this.tt = nodeCtr("tt");
        this.u = nodeCtr("u");
        this.ul = nodeCtr("ul");
        // var     = nodeCtr("var");
        this.video = nodeCtr("video");
        this.wbr = nodeCtr("wbr");
    }
    return JQNodeCtors;
}());
exports.t = new JQNodeCtors();
var i = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return elem.apply(void 0, ["i"].concat(args));
};
var fa = function (icn) { return i(".fa", ".fa-" + icn, { "aria-hidden": true }); };
exports.icon = {
    fa: fa,
    trash: fa("trash"),
    hashtag: fa("hashtag"),
    chevronRight: fa("chevron-right"),
    chevronLeft: fa("chevron-left")
};
function nodeCtr(tag) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return elem.apply(void 0, [tag].concat(args));
    };
}
function elem(tag) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var $tag = jquery_1["default"]("<" + tag + "></" + tag + ">");
    _.each(args, function (arg) {
        if (typeof arg === "string") {
            var re = /^[\\.#:@=]/;
            if (re.test(arg)) {
                arg.split(/ +/).forEach(function (attr) {
                    if (_.startsWith(attr, ".")) {
                        $tag.addClass(attr.slice(1));
                    }
                    else if (_.startsWith(attr, "#")) {
                        $tag.attr("id", attr.slice(1));
                    }
                    else if (_.startsWith(attr, ":")) {
                        $tag.attr("type", attr.slice(1));
                    }
                    else if (_.startsWith(attr, "@")) {
                        $tag.attr("name", attr.slice(1));
                    }
                    else if (_.startsWith(attr, "=")) {
                        $tag.attr("value", attr.slice(1));
                    }
                    else {
                        throw new Error("unexpected attribute type: " + attr);
                    }
                });
            }
            else {
                $tag.text(arg);
            }
        }
        else if (typeof arg === "object") {
            if (arg instanceof jquery_1["default"]) {
                $tag.append(arg);
            }
            else if (Array.isArray(arg)) {
                _.each(arg, function (a0) {
                    $tag.append(a0);
                });
            }
            else {
                _.each(_.toPairs(arg), function (_a) {
                    var k = _a[0], v = _a[1];
                    $tag.attr(k, v);
                });
            }
        }
        else {
            throw new Error("unexpected elem initializer: " + arg);
        }
    });
    return $tag;
}
function makeModal(form) {
    var modal = exports.t.div(".modal", ".fade", {
        "tabindex": "-1",
        "role": "dialog",
        "aria-hidden": true
    }, [
        exports.t.div(".modal-dialog", { role: "document" }, [
            exports.t.div(".modal-content", [
                exports.t.div(".modal-body", [
                    form
                ])
            ])
        ])
    ]);
    return modal;
}
exports.makeModal = makeModal;
exports.htm = {
    labeledTextInput: function (label, key) {
        return exports.t.span([
            exports.t.input(":text", "@" + key, "#" + key),
            exports.t.label({ "for": "$key" }, label)
        ]);
    },
    labeledTextboxInput: function (label, key) {
        return exports.t.span([
            exports.t.textarea(":textarea", "@" + key, "#" + key),
            exports.t.label({ "for": "$key" }, label)
        ]);
    },
    labeledFileInput: function (label, key) {
        return exports.t.div([
            exports.t.input(":file", "@" + key, "#" + key),
            exports.t.label({ "for": "$key" }, label)
        ]);
    },
    iconButton: function (iconName) {
        return exports.t.button(".btn-icon", [
            exports.icon.fa(iconName)
        ]);
    },
    makeRadios: function (name, values) {
        var radios = _.flatMap(LodashPlus_1.zipWithIndex(values), function (_a) {
            var _b = _a[0], val = _b[0], vicon = _b[1], initCheck = _b[2], tooltip = _b[3], callback = _b[4], vi = _a[1];
            var id = name + "-choice-" + vi;
            var btn = exports.t.input({
                name: name,
                id: id,
                type: "radio",
                value: val
            });
            if (initCheck) {
                jquery_1["default"](btn).attr("checked", initCheck);
                jquery_1["default"](btn).prop("checked", initCheck);
            }
            jquery_1["default"](btn).on("change", function () {
                // console.log("changing toolset", callback);
                if (jquery_1["default"](this).is(":checked")) {
                    callback();
                }
            });
            var label = exports.t.label({
                "for": id,
                title: tooltip
            }, [exports.icon.fa(vicon)]);
            return [btn, label];
        });
        var form = exports.t.form(".inline", [
            exports.t.span(".radio-switch", [
                radios
            ])
        ]);
        return form;
    },
    makeToggle: function (name, checkedIcon, uncheckedIcon, initCheck, tooltip) {
        var id = "my-toggle";
        var input = exports.t.input({
            name: name,
            id: id,
            type: "checkbox"
        });
        if (initCheck) {
            jquery_1["default"](input).attr("checked", initCheck.toString());
            jquery_1["default"](input).prop("checked", initCheck.toString());
        }
        var labelOn = exports.t.label(".checked", {
            "for": id,
            title: tooltip
        }, [exports.icon.fa(checkedIcon)]);
        var labelOff = exports.t.label(".unchecked", {
            "for": id,
            title: tooltip
        }, [exports.icon.fa(uncheckedIcon)]);
        var form = exports.t.form(".inline", [
            exports.t.span(".toggle-switch", [
                input, labelOn, labelOff
            ])
        ]);
        return form;
    }
};
