/**
 * Some helper functions for working with client-side html
 */
import * as _ from "lodash";
// import * as $ from "jquery";
import $ from "jquery";
import { zipWithIndex } from "./LodashPlus";
export function $id(selector) {
    return $(`#${selector}`);
}
export function mkNbsp(n) {
    const nx = n || 1;
    const nbsps = _.times(nx, _.constant("\u00A0"));
    return document.createTextNode(_.join(nbsps, ""));
}
class JQNodeCtors {
    constructor() {
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
}
export const t = new JQNodeCtors();
const i = (...args) => elem("i", ...args);
const fa = (icn) => i(".fa", `.fa-${icn}`, { "aria-hidden": true });
export const icon = {
    fa,
    trash: fa("trash"),
    hashtag: fa("hashtag"),
    chevronRight: fa("chevron-right"),
    chevronLeft: fa("chevron-left")
};
function nodeCtr(tag) {
    return (...args) => elem(tag, ...args);
}
function elem(tag, ...args) {
    const $tag = $(`<${tag}></${tag}>`);
    _.each(args, arg => {
        if (typeof arg === "string") {
            const re = /^[\\.#:@=]/;
            if (re.test(arg)) {
                arg.split(/ +/).forEach(attr => {
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
                        throw new Error(`unexpected attribute type: ${attr}`);
                    }
                });
            }
            else {
                $tag.text(arg);
            }
        }
        else if (typeof arg === "object") {
            if (arg instanceof $) {
                $tag.append(arg);
            }
            else if (Array.isArray(arg)) {
                _.each(arg, a0 => {
                    $tag.append(a0);
                });
            }
            else {
                _.each(_.toPairs(arg), ([k, v]) => {
                    $tag.attr(k, v);
                });
            }
        }
        else {
            throw new Error(`unexpected elem initializer: ${arg}`);
        }
    });
    return $tag;
}
export function makeModal(form) {
    const modal = t.div(".modal", ".fade", {
        "tabindex": "-1",
        "role": "dialog",
        "aria-hidden": true
    }, [
        t.div(".modal-dialog", { role: "document" }, [
            t.div(".modal-content", [
                t.div(".modal-body", [
                    form
                ])
            ])
        ])
    ]);
    return modal;
}
export const htm = {
    labeledTextInput: (label, key) => {
        return t.span([
            t.input(":text", `@${key}`, `#${key}`),
            t.label({ for: `$key` }, label)
        ]);
    },
    labeledTextboxInput: (label, key) => {
        return t.span([
            t.textarea(":textarea", `@${key}`, `#${key}`),
            t.label({ for: `$key` }, label)
        ]);
    },
    labeledFileInput: (label, key) => {
        return t.div([
            t.input(":file", `@${key}`, `#${key}`),
            t.label({ for: `$key` }, label)
        ]);
    },
    iconButton: (iconName) => {
        return t.button(".btn-icon", [
            icon.fa(iconName)
        ]);
    },
    makeRadios(name, values) {
        const radios = _.flatMap(zipWithIndex(values), ([[val, vicon, initCheck, tooltip, callback], vi]) => {
            const id = `${name}-choice-${vi}`;
            const btn = t.input({
                name,
                id,
                type: "radio",
                value: val
            });
            if (initCheck) {
                $(btn).attr("checked", initCheck);
                $(btn).prop("checked", initCheck);
            }
            $(btn).on("change", function () {
                // console.log("changing toolset", callback);
                if ($(this).is(":checked")) {
                    callback();
                }
            });
            const label = t.label({
                for: id,
                title: tooltip
            }, [icon.fa(vicon)]);
            return [btn, label];
        });
        const form = t.form(".inline", [
            t.span(".radio-switch", [
                radios
            ])
        ]);
        return form;
    },
    makeToggle(name, checkedIcon, uncheckedIcon, initCheck, tooltip) {
        const id = "my-toggle";
        const input = t.input({
            name,
            id,
            type: "checkbox",
        });
        if (initCheck) {
            $(input).attr("checked", initCheck.toString());
            $(input).prop("checked", initCheck.toString());
        }
        const labelOn = t.label(".checked", {
            for: id,
            title: tooltip
        }, [icon.fa(checkedIcon)]);
        const labelOff = t.label(".unchecked", {
            for: id,
            title: tooltip
        }, [icon.fa(uncheckedIcon)]);
        const form = t.form(".inline", [
            t.span(".toggle-switch", [
                input, labelOn, labelOff
            ])
        ]);
        return form;
    }
};
//# sourceMappingURL=tstags.js.map