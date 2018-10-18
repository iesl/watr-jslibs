/**
 * Some helper functions for working with client-side html
 */

import * as _ from "lodash";

import Vue, { CreateElement, VNode, VNodeData } from "vue";

type CtorArgs = string | object;

type NodeCtor = (...args: CtorArgs[]) => VNode;

class VNodeCtors {
    /* tslint:disable: member-access member-ordering typedef-whitespace */

    public a          : NodeCtor;
    public abbr       : NodeCtor;
    public acronym    : NodeCtor;
    public address    : NodeCtor;
    public applet     : NodeCtor;
    public area       : NodeCtor;
    public article    : NodeCtor;
    public aside      : NodeCtor;
    public audio      : NodeCtor;
    public b          : NodeCtor;
    public base       : NodeCtor;
    public basefont   : NodeCtor;
    public bdi        : NodeCtor;
    public bdo        : NodeCtor;
    public big        : NodeCtor;
    public blockquote : NodeCtor;
    public body       : NodeCtor;
    public br         : NodeCtor;
    public button     : NodeCtor;
    public canvas     : NodeCtor;
    public caption    : NodeCtor;
    public center     : NodeCtor;
    public cite       : NodeCtor;
    public code       : NodeCtor;
    public col        : NodeCtor;
    public colgroup   : NodeCtor;
    public data       : NodeCtor;
    public datalist   : NodeCtor;
    public dd         : NodeCtor;
    public del        : NodeCtor;
    public details    : NodeCtor;
    public dfn        : NodeCtor;
    public dialog     : NodeCtor;
    public dir        : NodeCtor;
    public div        : NodeCtor;
    public dl         : NodeCtor;
    public dt         : NodeCtor;
    public em         : NodeCtor;
    public embed      : NodeCtor;
    public fieldset   : NodeCtor;
    public figcaption : NodeCtor;
    public figure     : NodeCtor;
    public font       : NodeCtor;
    public footer     : NodeCtor;
    public form       : NodeCtor;
    public frame      : NodeCtor;
    public frameset   : NodeCtor;
    public h1         : NodeCtor;
    public h2         : NodeCtor;
    public h3         : NodeCtor;
    public h4         : NodeCtor;
    public h5         : NodeCtor;
    public h6         : NodeCtor;
    public head       : NodeCtor;
    public header     : NodeCtor;
    public hr         : NodeCtor;
    public html       : NodeCtor;
    public i          : NodeCtor;
    public iframe     : NodeCtor;
    public img        : NodeCtor;
    public input      : NodeCtor;
    public ins        : NodeCtor;
    public kbd        : NodeCtor;
    public label      : NodeCtor;
    public legend     : NodeCtor;
    public li         : NodeCtor;
    public link       : NodeCtor;
    public main       : NodeCtor;
    public map        : NodeCtor;
    public mark       : NodeCtor;
    public menu       : NodeCtor;
    public menuitem   : NodeCtor;
    public meta       : NodeCtor;
    public meter      : NodeCtor;
    public nav        : NodeCtor;
    public noframes   : NodeCtor;
    public noscript   : NodeCtor;
    // public // object  : NodeCtor;
    public ol         : NodeCtor;
    public optgroup   : NodeCtor;
    public option     : NodeCtor;
    public output     : NodeCtor;
    public p          : NodeCtor;
    public param      : NodeCtor;
    public picture    : NodeCtor;
    public pre        : NodeCtor;
    public progress   : NodeCtor;
    public q          : NodeCtor;
    public rp         : NodeCtor;
    public rt         : NodeCtor;
    public ruby       : NodeCtor;
    public s          : NodeCtor;
    public samp       : NodeCtor;
    public script     : NodeCtor;
    public section    : NodeCtor;
    public select     : NodeCtor;
    public small      : NodeCtor;
    public source     : NodeCtor;
    public span       : NodeCtor;
    public strike     : NodeCtor;
    public strong     : NodeCtor;
    public style      : NodeCtor;
    public sub        : NodeCtor;
    public summary    : NodeCtor;
    public sup        : NodeCtor;
    public table      : NodeCtor;
    public tbody      : NodeCtor;
    public td         : NodeCtor;
    public textarea   : NodeCtor;
    public tfoot      : NodeCtor;
    public th         : NodeCtor;
    public thead      : NodeCtor;
    public time       : NodeCtor;
    public title      : NodeCtor;
    public tr         : NodeCtor;
    public track      : NodeCtor;
    public tt         : NodeCtor;
    public u          : NodeCtor;
    public ul         : NodeCtor;
    // public // var     : NodeCtor;
    public video      : NodeCtor;
    public wbr        : NodeCtor;

    private vm: Vue;
    private createElement: CreateElement;

    constructor(vm: Vue) {
        this.vm = vm;
        this.createElement = vm.$createElement;

        // const keys = _.keysIn(this as HtmlTags<VNode>);
        // console.log("keys?", keys);

        this.a          = this.nodeCtr("a");
        this.abbr       = this.nodeCtr("abbr");
        this.acronym    = this.nodeCtr("acronym");
        this.address    = this.nodeCtr("address");
        this.applet     = this.nodeCtr("applet");
        this.area       = this.nodeCtr("area");
        this.article    = this.nodeCtr("article");
        this.aside      = this.nodeCtr("aside");
        this.audio      = this.nodeCtr("audio");
        this.b          = this.nodeCtr("b");
        this.base       = this.nodeCtr("base");
        this.basefont   = this.nodeCtr("basefont");
        this.bdi        = this.nodeCtr("bdi");
        this.bdo        = this.nodeCtr("bdo");
        this.big        = this.nodeCtr("big");
        this.blockquote = this.nodeCtr("blockquote");
        this.body       = this.nodeCtr("body");
        this.br         = this.nodeCtr("br");
        this.button     = this.nodeCtr("button");
        this.canvas     = this.nodeCtr("canvas");
        this.caption    = this.nodeCtr("caption");
        this.center     = this.nodeCtr("center");
        this.cite       = this.nodeCtr("cite");
        this.code       = this.nodeCtr("code");
        this.col        = this.nodeCtr("col");
        this.colgroup   = this.nodeCtr("colgroup");
        this.data       = this.nodeCtr("data");
        this.datalist   = this.nodeCtr("datalist");
        this.dd         = this.nodeCtr("dd");
        this.del        = this.nodeCtr("del");
        this.details    = this.nodeCtr("details");
        this.dfn        = this.nodeCtr("dfn");
        this.dialog     = this.nodeCtr("dialog");
        this.dir        = this.nodeCtr("dir");
        this.div        = this.nodeCtr("div");
        this.dl         = this.nodeCtr("dl");
        this.dt         = this.nodeCtr("dt");
        this.em         = this.nodeCtr("em");
        this.embed      = this.nodeCtr("embed");
        this.fieldset   = this.nodeCtr("fieldset");
        this.figcaption = this.nodeCtr("figcaption");
        this.figure     = this.nodeCtr("figure");
        this.font       = this.nodeCtr("font");
        this.footer     = this.nodeCtr("footer");
        this.form       = this.nodeCtr("form");
        this.frame      = this.nodeCtr("frame");
        this.frameset   = this.nodeCtr("frameset");
        this.h1         = this.nodeCtr("h1");
        this.h2         = this.nodeCtr("h2");
        this.h3         = this.nodeCtr("h3");
        this.h4         = this.nodeCtr("h4");
        this.h5         = this.nodeCtr("h5");
        this.h6         = this.nodeCtr("h6");
        this.head       = this.nodeCtr("head");
        this.header     = this.nodeCtr("header");
        this.hr         = this.nodeCtr("hr");
        this.html       = this.nodeCtr("html");
        this.i          = this.nodeCtr("i");
        this.iframe     = this.nodeCtr("iframe");
        this.img        = this.nodeCtr("img");
        this.input      = this.nodeCtr("input");
        this.ins        = this.nodeCtr("ins");
        this.kbd        = this.nodeCtr("kbd");
        this.label      = this.nodeCtr("label");
        this.legend     = this.nodeCtr("legend");
        this.li         = this.nodeCtr("li");
        this.link       = this.nodeCtr("link");
        this.main       = this.nodeCtr("main");
        this.map        = this.nodeCtr("map");
        this.mark       = this.nodeCtr("mark");
        this.menu       = this.nodeCtr("menu");
        this.menuitem   = this.nodeCtr("menuitem");
        this.meta       = this.nodeCtr("meta");
        this.meter      = this.nodeCtr("meter");
        this.nav        = this.nodeCtr("nav");
        this.noframes   = this.nodeCtr("noframes");
        this.noscript   = this.nodeCtr("noscript");
        // this.// object  = this.nodeCtr("// object");
        this.ol         = this.nodeCtr("ol");
        this.optgroup   = this.nodeCtr("optgroup");
        this.option     = this.nodeCtr("option");
        this.output     = this.nodeCtr("output");
        this.p          = this.nodeCtr("p");
        this.param      = this.nodeCtr("param");
        this.picture    = this.nodeCtr("picture");
        this.pre        = this.nodeCtr("pre");
        this.progress   = this.nodeCtr("progress");
        this.q          = this.nodeCtr("q");
        this.rp         = this.nodeCtr("rp");
        this.rt         = this.nodeCtr("rt");
        this.ruby       = this.nodeCtr("ruby");
        this.s          = this.nodeCtr("s");
        this.samp       = this.nodeCtr("samp");
        this.script     = this.nodeCtr("script");
        this.section    = this.nodeCtr("section");
        this.select     = this.nodeCtr("select");
        this.small      = this.nodeCtr("small");
        this.source     = this.nodeCtr("source");
        this.span       = this.nodeCtr("span");
        this.strike     = this.nodeCtr("strike");
        this.strong     = this.nodeCtr("strong");
        this.style      = this.nodeCtr("style");
        this.sub        = this.nodeCtr("sub");
        this.summary    = this.nodeCtr("summary");
        this.sup        = this.nodeCtr("sup");
        this.table      = this.nodeCtr("table");
        this.tbody      = this.nodeCtr("tbody");
        this.td         = this.nodeCtr("td");
        this.textarea   = this.nodeCtr("textarea");
        this.tfoot      = this.nodeCtr("tfoot");
        this.th         = this.nodeCtr("th");
        this.thead      = this.nodeCtr("thead");
        this.time       = this.nodeCtr("time");
        this.title      = this.nodeCtr("title");
        this.tr         = this.nodeCtr("tr");
        this.track      = this.nodeCtr("track");
        this.tt         = this.nodeCtr("tt");
        this.u          = this.nodeCtr("u");
        this.ul         = this.nodeCtr("ul");
        // this.// var     = this.nodeCtr("var");
        this.video      = this.nodeCtr("video");
        this.wbr        = this.nodeCtr("wbr");

        // fa = (icn: string) => this.i(".fa", `.fa-${icn}`, {"aria-hidden": true});

        // icon = {
        //     fa           : this.fa,
        //     trash        : this.fa("trash"),
        //     hashtag      : this.fa("hashtag"),
        //     chevronRight : this.fa("chevron-right"),
        //     chevronLeft  : this.fa("chevron-left")
        // };

    }

    nodeCtr(tag: string): (...args: CtorArgs[]) => VNode {
        return (...args) => this.elem(tag, ...args);
    }

    elem(tag: string, ...args: CtorArgs[]): VNode {
        // const $tag = $(`<${tag}></${tag}>`);
        const data: VNodeData = {
            // class: [] as string[],
            attrs: {}
        };

        const children: Array<VNode | string> = [];

        let text: string;

        // console.log("elem: vue: ", Vue);
        // console.log("elem: vnode: ", VNode);

        _.each(args, arg => {
            console.log("elem: each arg: ", arg, typeof arg);
            if (typeof arg === "string") {
                const re = /^[\\.#:@=]/;
                if (re.test(arg)) {
                    arg.split(/ +/).forEach(attr => {
                        const attr1 = attr.slice(1);
                        const a0 = attr[0];
                        let path = "";
                        switch (a0) {
                            case "#":
                                path = "attrs.id";
                                _.set(data, path, attr1);
                                break;
                            case "@":
                                path = "attrs.name";
                                _.set(data, path, attr1);
                                break;
                            case "=":
                                path = "attrs.value";
                                _.set(data, path, attr1);
                                break;
                            case ":":
                                path = "attrs.type";
                                _.set(data, path, attr1);
                                break;
                            case ".":
                                // const curr = _.get(data, "class", "");
                                // _.set(data, "class", curr + " " + attr1);
                                _.set(data, `class.${attr1}`, true);
                                break;
                            default: throw new Error("unexpected attribute type: " + attr);
                        }
                    });
                } else {
                    text = arg;
                    children.push(arg);
                }
            } else if (typeof arg === "object") {
                // if (arg instanceof VNode) {
                //     children.push(arg as VNode);
                // } else if (Array.isArray(arg)) {
                if (Array.isArray(arg)) {
                    _.each(arg, (x) => {
                        // console.log("    : arg: ", x);
                        children.push(x);
                    });
                } else {
                    _.each(_.toPairs(arg), ([key, val]) => {
                        _.set(data.attrs as any, key, val);
                    });
                }
            } else {
                throw new Error("unexpected elem initializer: " + arg);
            }
        });

        const velem = this.createElement(tag, data, children);
        if (text) {
            velem.text = text;
        }

        return velem;
    }

}

export function vtags(vm: Vue): VNodeCtors {
    return new VNodeCtors(vm);
}
