
import * as $ from "jquery";

export function run()  {
    $.getJSON("/data/tracelog/2", (tracelogs: LogEntry[]) => {
    })
}


