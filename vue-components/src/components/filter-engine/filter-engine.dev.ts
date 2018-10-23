

import Vue from 'vue';
import * as $ from "jquery";

import FilterWidget from '@/components/filter-engine/filter-engine.vue';
import feState from './filter-engine-state';

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

    const sss = $.getJSON("http://localhost:3000/tracelog-0.json", (tracelogs: LogEntry[]) => {
      console.log("tracelogs", tracelogs);

      const candidates = [
        {candidate: {}, multikey: ['a', 'b'], displayTitle: 'item1'},
        {candidate: {}, multikey: ['a', 'b'], displayTitle: 'item2'},
        {candidate: {}, multikey: ['a', 'c'], displayTitle: 'item3'},
        {candidate: {}, multikey: ['b', 'c'], displayTitle: 'item4'},
      ];

      feState.mod.setCandidates(candidates);

    }, (err) => {
      console.log("err", err);

    });


  }
});
