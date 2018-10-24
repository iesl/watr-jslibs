

import Vue from 'vue';
// import * as $ from "jquery";
import $ from "jquery";

import FilterWidget from '@/components/filter-engine/filter-engine.vue';
import feState from './filter-engine-state';

import { candidateGroupF, pp } from './dev-helpers';
import { CandidateGroup } from './FilterEngine';

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

export default Vue.extend({
  name: 'FilterEngineDev',
  components: {
    FilterWidget
  },

  created: function() {

  },

  mounted: function() {

    const sss = $.getJSON("http://localhost:3000/tracelog-2.json", (tracelogs: LogEntry[]) => {
      console.log("tracelogs", pp(tracelogs[0]));

      const g: CandidateGroup = {
        candidates: tracelogs,
        groupKeyFunc: (l: LogEntry) => ({ multikey: ["trace", `p${l.page+1}. ${l.headers.callSite} ${l.headers.tags}`], displayTitle: "todo" })
      };

      feState.mod.addCandidateGroup(g);
      // const candidates1 = candidateGroupF("foo", "alex", (g) => {
      //   const r = { candidate: {}, multikey: ['alex', 'bob'], displayTitle: 'item1' };
      //   return r;
      // });

      // const candidates2 = candidateGroupF("foo", "alex", (g) => {
      //   const r = { candidate: {}, multikey: ['alex', 'doug'], displayTitle: 'item1' };
      //   return r;
      // });

      // const candidates3 = candidateGroupF("foo", "alex", (g) => {
      //   const r = { candidate: {}, multikey: ['bill', 'claire'], displayTitle: 'item1' };
      //   return r;
      // });


      // // massage candidates into correct shape
      // feState.mod.addCandidateGroup(candidates1);
      // feState.mod.addCandidateGroup(candidates2);
      // feState.mod.addCandidateGroup(candidates3);

    }, (err) => {
      console.log("err", err);

    });


  }
});
