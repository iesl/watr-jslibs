
import * as $ from "jquery";
import * as spu from "../client/lib/SplitWin.js";
import { t } from "../client/lib/tstags";

import FilterWidget from "watr-vue-comps";
// {
//   // CandidateGroup
// } from "watr-vue-comps";

import Vue from "vue";

interface Headers {
  tags: string;
  name: string;
  callSite: string;
}

interface LogEntry {
  logType: string;
  page: number;
  headers: Headers;
}
export function run()  {
  const rootFrame = spu.createRootFrame("#main");
  rootFrame.setDirection(spu.row);

  const [paneLeft, paneRight] = rootFrame.addPanes(2);

  $(paneLeft.clientAreaSelector()).append(
    t.div(".scrollable-pane", [
      t.div("#tracelog-menu")
    ])
  );


  const vueInstance = new Vue({
    name: 'FilterEngineDev',


    components: {
      FilterWidget
    },

    mounted() {

      $.getJSON("http://localhost:3000/tracelog-2.json", (tracelogs: LogEntry[]) => {
        // console.log("tracelogs", pp(tracelogs[0]));

        const g: CandidateGroup = {
          candidates: tracelogs,
          groupKeyFunc: (l: LogEntry) => ({ multikey: ["trace", `p${l.page+1}. ${l.headers.callSite} ${l.headers.tags}`], displayTitle: "todo" })
        };


        filterEngineState.mutations.addCandidateGroup(g);

        const candidates1 = candidateGroupF("foo", "alex", (g) => {
          const r = { candidate: {}, multikey: ['annot', g.name, g.tags], displayTitle: g.logType };
          return r;
        });

        filterEngineState.mutations.addCandidateGroup(candidates1);

      }, (err) => {
        console.log("err", err);

      });


    }
  });

  $.getJSON("/data/tracelog/2", (tracelogs: LogEntry[]) => {
    // const traceLogs = new sfw.SelectionFilterWidget(tracelogs);

    const g: CandidateGroup = {
      candidates: tracelogs,
      groupKeyFunc: (l: LogEntry) => ["trace", `p${l.page+1}. ${l.headers.callSite} ${l.headers.tags}`]
    };
    // filterWidget.addCandidates(g);
    // filterWidget.doIndexing();
    // const filterWidget = new sfw.SelectionFilterWidget([g]);


    // const n = filterWidget.getNode();
    // const vueNode = filterWidget.getVueNode();
    // console.log(vueNode);
    // const el = vueNode.$mount("#tracelog-menu");
    // const el = vueNode.$mount();
    // const node = el.$el;
    // console.log("el", el);
    // console.log("el.node", node);

    // $("#tracelog-menu").append(node);
    vueInstance.$mount('#tracelog-menu');
    // const rxDisplay = sfw.displayRx(filterWidget);
    // paneRight.clientArea().append(
    //   rxDisplay
    // );
  });

}
