/**
 * Load only the parts of d3 actually being used, so that webpack can cull out the remainder
 **/

// d3-combined.js
// import * as array       from "d3-array";
// import * as axis        from "d3-axis";
// import * as brush       from "d3-brush";
// import * as chord       from "d3-chord";
// import * as collection  from "d3-collection";
// import * as color       from "d3-color";
// import * as dispatch    from "d3-dispatch";
// import * as drag        from "d3-drag";
// import * as dsv         from "d3-dsv";
// import * as ease        from "d3-ease";
// import * as force       from "d3-force";
// import * as format      from "d3-format";
// import * as geo         from "d3-geo";
// import * as hierarchy   from "d3-hierarchy";
// import * as interpolate from "d3-interpolate";
// import * as path        from "d3-path";
// import * as polygon     from "d3-polygon";
// import * as quadtree    from "d3-quadtree";
// import * as queue       from "d3-queue";
// import * as random      from "d3-random";
// import * as request     from "d3-request";
// import * as scale       from "d3-scale";
import * as selection   from "d3-selection";
// import * as shape       from "d3-shape";
// import * as time        from "d3-time";
// import * as timeformat  from "d3-time-format";
// import * as timer       from "d3-timer";
import * as transition  from "d3-transition";
// import * as voronoi     from "d3-voronoi";
// import * as zoom        from "d3-zoom";

export default Object.assign({},
                             // array,
                             // axis,
                             // brush,
                             // chord,
                             // collection,
                             // color,
                             // dispatch,
                             // drag,
                             // dsv,
                             // ease,
                             // force,
                             // format,
                             // geo,
                             // hierarchy,
                             // interpolate,
                             // path,
                             // polygon,
                             // quadtree,
                             // queue,
                             // random,
                             // request,
                             // scale,
                             selection,
                             // shape,
                             // time,
                             // timeformat,
                             // timer,
                             transition,
                             // voronoi,
                             // zoom
                            );



