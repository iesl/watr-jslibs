
import * as _ from 'lodash';

import { Vue, Component, Prop, Watch } from "vue-property-decorator";

// import {
//   Module,
//   GetterTree,
//   MutationTree,
//   ActionTree,
//   Plugin
// } from 'vuex';

// import {namespace} from "vuex-class";

import {
  TextDataPoint,
  // initGridData
} from '../../lib/TextGlyphDataTypes'


import {
  coords,
  MouseHandlerSets as mhs,
  MouseHandlers,
  GridTypes,
  Point,
  BBox,
  tstags,
  d3x,
  getOrDie
} from "sharedLib";

import * as rtree from "rbush";


@Component
export default class PdfPage extends Vue {
  @Prop({default: 0}) pageNum!: number;

  public glyphRtree: rbush.RBush<TextDataPoint> = rtree<TextDataPoint>();

  get frameId(): string { return `page-image-frame-${this.pageNum}`; }
  get svgId(): string { return `page-image-svg-${this.pageNum}`; }
}
