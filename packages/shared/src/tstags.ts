/**
 * Some helper functions for working with client-side html
 */

import * as _ from "lodash";
import * as $ from "jquery";

import {zipWithIndex} from "./LodashPlus";

type JQArgs = string | object;

export function $id(selector: string) {
  return $(`#${selector}`);
}

export function mkNbsp(n: number): Text {
  const nx = n || 1;
  const nbsps = _.times(nx, _.constant("\u00A0"));
  return document.createTextNode(_.join(nbsps, ""));
}

class JQNodeCtors {
  nbsp = mkNbsp;
  /* tslint:disable: member-access */
  a = nodeCtr("a");
  abbr = nodeCtr("abbr");
  acronym = nodeCtr("acronym");
  address = nodeCtr("address");
  applet = nodeCtr("applet");
  area = nodeCtr("area");
  article = nodeCtr("article");
  aside = nodeCtr("aside");
  audio = nodeCtr("audio");
  b = nodeCtr("b");
  base = nodeCtr("base");
  basefont = nodeCtr("basefont");
  bdi = nodeCtr("bdi");
  bdo = nodeCtr("bdo");
  big = nodeCtr("big");
  blockquote = nodeCtr("blockquote");
  body = nodeCtr("body");
  br = nodeCtr("br");
  button = nodeCtr("button");
  canvas = nodeCtr("canvas");
  caption = nodeCtr("caption");
  center = nodeCtr("center");
  cite = nodeCtr("cite");
  code = nodeCtr("code");
  col = nodeCtr("col");
  colgroup = nodeCtr("colgroup");
  data = nodeCtr("data");
  datalist = nodeCtr("datalist");
  dd = nodeCtr("dd");
  del = nodeCtr("del");
  details = nodeCtr("details");
  dfn = nodeCtr("dfn");
  dialog = nodeCtr("dialog");
  dir = nodeCtr("dir");
  div = nodeCtr("div");
  dl = nodeCtr("dl");
  dt = nodeCtr("dt");
  em = nodeCtr("em");
  embed = nodeCtr("embed");
  fieldset = nodeCtr("fieldset");
  figcaption = nodeCtr("figcaption");
  figure = nodeCtr("figure");
  font = nodeCtr("font");
  footer = nodeCtr("footer");
  form = nodeCtr("form");
  frame = nodeCtr("frame");
  frameset = nodeCtr("frameset");
  h1 = nodeCtr("h1");
  h2 = nodeCtr("h2");
  h3 = nodeCtr("h3");
  h4 = nodeCtr("h4");
  h5 = nodeCtr("h5");
  h6 = nodeCtr("h6");
  head = nodeCtr("head");
  header = nodeCtr("header");
  hr = nodeCtr("hr");
  html = nodeCtr("html");
  i = nodeCtr("i");
  iframe = nodeCtr("iframe");
  img = nodeCtr("img");
  input = nodeCtr("input");
  ins = nodeCtr("ins");
  kbd = nodeCtr("kbd");
  label = nodeCtr("label");
  legend = nodeCtr("legend");
  li = nodeCtr("li");
  link = nodeCtr("link");
  main = nodeCtr("main");
  map = nodeCtr("map");
  mark = nodeCtr("mark");
  menu = nodeCtr("menu");
  menuitem = nodeCtr("menuitem");
  meta = nodeCtr("meta");
  meter = nodeCtr("meter");
  nav = nodeCtr("nav");
  noframes = nodeCtr("noframes");
  noscript = nodeCtr("noscript");
  // object  = nodeCtr("// object");
  ol = nodeCtr("ol");
  optgroup = nodeCtr("optgroup");
  option = nodeCtr("option");
  output = nodeCtr("output");
  p = nodeCtr("p");
  param = nodeCtr("param");
  picture = nodeCtr("picture");
  pre = nodeCtr("pre");
  progress = nodeCtr("progress");
  q = nodeCtr("q");
  rp = nodeCtr("rp");
  rt = nodeCtr("rt");
  ruby = nodeCtr("ruby");
  s = nodeCtr("s");
  samp = nodeCtr("samp");
  script = nodeCtr("script");
  section = nodeCtr("section");
  select = nodeCtr("select");
  small = nodeCtr("small");
  source = nodeCtr("source");
  span = nodeCtr("span");
  strike = nodeCtr("strike");
  strong = nodeCtr("strong");
  style = nodeCtr("style");
  sub = nodeCtr("sub");
  summary = nodeCtr("summary");
  sup = nodeCtr("sup");
  table = nodeCtr("table");
  tbody = nodeCtr("tbody");
  td = nodeCtr("td");
  textarea = nodeCtr("textarea");
  tfoot = nodeCtr("tfoot");
  th = nodeCtr("th");
  thead = nodeCtr("thead");
  time = nodeCtr("time");
  title = nodeCtr("title");
  tr = nodeCtr("tr");
  track = nodeCtr("track");
  tt = nodeCtr("tt");
  u = nodeCtr("u");
  ul = nodeCtr("ul");
  // var     = nodeCtr("var");
  video = nodeCtr("video");
  wbr = nodeCtr("wbr");
}

export const t: JQNodeCtors = new JQNodeCtors();

const i = (...args: JQArgs[]) => elem("i", ...args);

const fa = (icn: string) => i(".fa", `.fa-${icn}`, {"aria-hidden": true});

export const icon = {
  fa,
  trash: fa("trash"),
  hashtag: fa("hashtag"),
  chevronRight: fa("chevron-right"),
  chevronLeft: fa("chevron-left"),
};

function nodeCtr(tag: string): (...args: JQArgs[]) => JQuery<HTMLElement> {
  return (...args) => elem(tag, ...args);
}
function elem(tag: string, ...args: JQArgs[]): JQuery<HTMLElement> {
  const $tag = $(`<${tag}></${tag}>`);
  _.each(args, arg => {
    if (typeof arg === "string") {
      const re = /^[\\.#:@=]/;
      if (re.test(arg)) {
        arg.split(/ +/).forEach(attr => {
          if (_.startsWith(attr, ".")) {
            $tag.addClass(attr.slice(1));
          } else if (_.startsWith(attr, "#")) {
            $tag.attr("id", attr.slice(1));
          } else if (_.startsWith(attr, ":")) {
            $tag.attr("type", attr.slice(1));
          } else if (_.startsWith(attr, "@")) {
            $tag.attr("name", attr.slice(1));
          } else if (_.startsWith(attr, "=")) {
            $tag.attr("value", attr.slice(1));
          } else {
            throw new Error(`unexpected attribute type: ${attr}`);
          }
        });
      } else {
        $tag.text(arg);
      }
    } else if (typeof arg === "object") {
      if (arg instanceof $) {
        $tag.append(arg as JQuery);
      } else if (Array.isArray(arg)) {
        _.each(arg, a0 => {
          $tag.append(a0);
        });
      } else {
        _.each(_.toPairs(arg), ([k, v]) => {
          $tag.attr(k, v);
        });
      }
    } else {
      throw new Error(`unexpected elem initializer: ${arg}`);
    }
  });

  return $tag;
}

export function makeModal(form: JQuery<HTMLElement>) {
  const modal = t.div(
    ".modal",
    ".fade",
    {
      tabindex: "-1",
      role: "dialog",
      "aria-hidden": true,
    },
    [
      t.div(".modal-dialog", {role: "document"}, [
        t.div(".modal-content", [t.div(".modal-body", [form])]),
      ]),
    ],
  );

  return modal;
}

export const htm = {
  labeledTextInput: (label: string, key: string) => {
    return t.span([
      t.input(":text", `@${key}`, `#${key}`),
      t.label({for: `$key`}, label),
    ]);
  },

  labeledTextboxInput: (label: string, key: string) => {
    return t.span([
      t.textarea(":textarea", `@${key}`, `#${key}`),
      t.label({for: `$key`}, label),
    ]);
  },

  labeledFileInput: (label: string, key: string) => {
    return t.div([
      t.input(":file", `@${key}`, `#${key}`),
      t.label({for: `$key`}, label),
    ]);
  },

  iconButton: (iconName: string) => {
    return t.button(".btn-icon", [icon.fa(iconName)]);
  },

  makeRadios(name: string, values: any[]) {
    const radios = _.flatMap(
      zipWithIndex(values),
      ([[val, vicon, initCheck, tooltip, callback], vi]) => {
        const id = `${name}-choice-${vi}`;
        const btn = t.input({
          name,
          id,
          type: "radio",
          value: val,
        });

        if (initCheck) {
          $(btn).attr("checked", initCheck);
          $(btn).prop("checked", initCheck);
        }

        $(btn).on("change", function() {
          // console.log("changing toolset", callback);
          if ($(this).is(":checked")) {
            callback();
          }
        });

        const label = t.label(
          {
            for: id,
            title: tooltip,
          },
          [icon.fa(vicon)],
        );

        return [btn, label];
      },
    );
    const form = t.form(".inline", [t.span(".radio-switch", [radios])]);
    return form;
  },

  makeToggle(
    name: string,
    checkedIcon: string,
    uncheckedIcon: string,
    initCheck: boolean,
    tooltip: string,
  ) {
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

    const labelOn = t.label(
      ".checked",
      {
        for: id,
        title: tooltip,
      },
      [icon.fa(checkedIcon)],
    );

    const labelOff = t.label(
      ".unchecked",
      {
        for: id,
        title: tooltip,
      },
      [icon.fa(uncheckedIcon)],
    );

    const form = t.form(".inline", [
      t.span(".toggle-switch", [input, labelOn, labelOff]),
    ]);
    return form;
  },
};
