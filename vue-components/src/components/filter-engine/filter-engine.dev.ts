

import Vue from 'vue';
import * as $ from "jquery";

import FilterWidget from '@/components/filter-engine/filter-engine.vue';

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

        const sss = $.getJSON("http://localhost:3000/tracelog-0.json", (tracelogs: LogEntry[]) => {
            console.log("tracelogs", tracelogs);

        }, (err) => {
            console.log("err", err);

        });


    }
});
